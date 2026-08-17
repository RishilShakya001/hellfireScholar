import pdf from "pdf-parse";
import fs from "fs";
import { Note } from "../models/note.models.js";
import { StudyNoteChunk } from "../models/studyNoteChunk.models.js";
import { generateEmbeddings } from "./embeddingService.js";

// Clean extracted text: remove multiple consecutive spaces/tabs/newlines
const cleanText = (text) => {
  return text
    .replace(/[\r\t\f]+/g, " ")
    .replace(/[ ]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
};

/**
 * Splits text into chunks of maximum size with a defined overlap.
 * It attempts to split at paragraph or sentence boundaries when possible.
 * 
 * Why overlap is required:
 * To preserve semantic context at boundaries. If a sentence or paragraph is cut 
 * exactly at a character limit, key concepts can be split across chunks, making 
 * the text less meaningful for semantic search. Overlapping ensures boundary 
 * concepts are preserved in adjacent chunks.
 */
export const chunkText = (text, chunkSize = 800, overlap = 150) => {
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex > text.length) {
      endIndex = text.length;
    } else {
      // Find paragraph boundary or space within the last 200 characters
      const boundaryIndex = text.lastIndexOf("\n", endIndex);
      if (boundaryIndex > startIndex + chunkSize - 200) {
        endIndex = boundaryIndex + 1;
      } else {
        const spaceIndex = text.lastIndexOf(" ", endIndex);
        if (spaceIndex > startIndex + chunkSize - 100) {
          endIndex = spaceIndex + 1;
        }
      }
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = endIndex - overlap;
    if (startIndex >= endIndex) {
      startIndex = endIndex;
    }
  }

  return chunks;
};

/**
 * Handles the complete RAG ingestion pipeline for a note.
 */
export const ingestNote = async (noteId, localFilePath = null) => {
  console.log(`[RAG] Starting ingestion for note ${noteId}...`);
  const note = await Note.findById(noteId);
  if (!note) {
    console.error(`[RAG] Note ${noteId} not found.`);
    return;
  }

  // Update note status to processing
  note.ingestionStatus = "processing";
  note.ingestionError = undefined;
  await note.save();

  try {
    const pages = [];

    if (localFilePath && fs.existsSync(localFilePath)) {
      // PDF document ingestion using local file path directly
      console.log(`[RAG] Extracting text page-by-page from local file: ${localFilePath}`);
      const buffer = fs.readFileSync(localFilePath);

      const pageTexts = [];
      const options = {
        pagerender: async (pageData) => {
          return pageData.getTextContent().then((textContent) => {
            const text = textContent.items.map((item) => item.str).join(" ");
            pageTexts.push({
              pageNumber: pageData.pageIndex + 1,
              text: cleanText(text),
            });
            return text;
          });
        },
      };

      await pdf(buffer, options);

      // Verify that text was successfully extracted
      const totalTextLen = pageTexts.reduce((acc, curr) => acc + curr.text.length, 0);
      if (totalTextLen === 0) {
        throw new Error("No extractable text found in local PDF note");
      }

      pages.push(...pageTexts);
    } else if (note.fileUrl) {
      // PDF document ingestion by downloading from Cloudinary
      console.log(`[RAG] Downloading PDF from Cloudinary: ${note.fileUrl}`);
      const response = await fetch(note.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to download PDF from Cloudinary: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text page-by-page
      console.log(`[RAG] Extracting text page-by-page...`);
      const pageTexts = [];
      const options = {
        pagerender: async (pageData) => {
          return pageData.getTextContent().then((textContent) => {
            const text = textContent.items.map((item) => item.str).join(" ");
            pageTexts.push({
              pageNumber: pageData.pageIndex + 1,
              text: cleanText(text),
            });
            return text;
          });
        },
      };

      await pdf(buffer, options);

      // Verify that text was successfully extracted
      const totalTextLen = pageTexts.reduce((acc, curr) => acc + curr.text.length, 0);
      if (totalTextLen === 0) {
        throw new Error("No extractable text found in PDF note");
      }

      pages.push(...pageTexts);
    } else if (note.content) {
      // Plain text notepad note ingestion
      console.log(`[RAG] Reading text note content...`);
      pages.push({
        pageNumber: 1,
        text: cleanText(note.content),
      });
    } else {
      throw new Error("Note has neither a PDF file nor text content.");
    }

    // Process chunking and embeddings
    const chunkSize = Number(process.env.RAG_CHUNK_SIZE) || 800;
    const overlap = Number(process.env.RAG_CHUNK_OVERLAP) || 150;

    const allChunksToInsert = [];
    const textListToEmbed = [];

    for (const page of pages) {
      if (page.text.length === 0) continue;
      const chunks = chunkText(page.text, chunkSize, overlap);
      
      chunks.forEach((chunk, index) => {
        allChunksToInsert.push({
          userId: note.userId,
          noteId: note._id,
          subjectId: note.subjectId,
          documentTitle: note.title,
          pageNumber: page.pageNumber,
          chunkIndex: index,
          text: chunk,
        });
        textListToEmbed.push(chunk);
      });
    }

    if (allChunksToInsert.length === 0) {
      throw new Error("No text chunks generated for note");
    }

    console.log(`[RAG] Generating embeddings for ${allChunksToInsert.length} chunks in batches...`);
    
    // Batch embeddings call to prevent rate limit and sequential latency
    const embeddings = await generateEmbeddings(textListToEmbed);

    // Map embeddings back to chunks
    allChunksToInsert.forEach((chunk, index) => {
      chunk.embedding = embeddings[index];
    });

    // Save to database
    console.log(`[RAG] Saving chunks to MongoDB...`);
    // Delete any old chunks first if this is a re-ingestion
    await StudyNoteChunk.deleteMany({ noteId: note._id });
    await StudyNoteChunk.insertMany(allChunksToInsert);

    // Update status to completed
    note.ingestionStatus = "completed";
    await note.save();
    console.log(`[RAG] Ingestion completed successfully for note ${noteId}.`);
  } catch (err) {
    console.error(`[RAG] Ingestion failed for note ${noteId}:`, err.message);
    note.ingestionStatus = "failed";
    note.ingestionError = err.message;
    await note.save();

    // Clean up any partially created chunks on failure
    await StudyNoteChunk.deleteMany({ noteId: note._id });
  } finally {
    // Programmatic cleanup of temporary local file
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log(`[RAG] Cleaned up temporary ingestion file: ${localFilePath}`);
      } catch (unlinkErr) {
        console.error(`[RAG] Failed to delete temp file ${localFilePath}:`, unlinkErr.message);
      }
    }
  }
};
