import { OpenAI } from "openai";
import * as cheerio from "cheerio";
import { Request, Response } from "express";
const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// function to fetch contain
async function fetchPageContent(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("HTTP Error");
  }
  const data = await response.text();
  const $ = cheerio.load(data);

  let textContent = $("body").text();
  textContent = textContent.replace(/\s+/g, " ").trim(); // extra space
  const words = textContent.split(" ").slice(0, 125).join(" ");
  console.log(words);
  return words;
}

// generate tags and summary
async function generateTagsAndSummary(pageUrl: string) {
  const pageContent = await fetchPageContent(pageUrl);
  const summaryResponse = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Summarize the following content ${pageContent} in 150 words`,
      },
      {
        role: "system",
        content: "You are a helpful assistant that summarizes and generate tags",
      },
    ],
  });

  const tagsResponse = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Generate 5 relevant tags for the following content ${pageContent}`,
      },
      {
        role: "system",
        content: "You are a helpful assistant that summarizes and generate tags",
      },
    ],
  });
  console.log({
    summaryResponse,
    tagsResponse,
  });
  const summary = summaryResponse.choices[0].message?.content.trim() ?? "";
  const tags =
    tagsResponse.choices[0].message?.content
      .trim()
      .split(",")
      .map((tag) => tag.trim()) ?? [];

  return {
    summary,
    tags,
  };
}

export const genereatedTagNsummaryByAI = async (req: Request, res: Response) => {
  const { url } = req.body;
  try {
    const { summary, tags } = await generateTagsAndSummary(url);
    res.status(200).json({
      status: "success",
      data: {
        summary,
        tags,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

export const generateBybart = async (req: Request, res: Response) => {
  const { url } = req.body;
  try {
    const pageContent = await fetchPageContent(url);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: "Bearer ",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(pageContent),
      }
    );
    const result = await response.json();
    res.status(200).json({
      status: "success",
      data: {
        result,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

async function query(pageUrl: string) {
  const pageContent = await fetchPageContent(pageUrl);
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      headers: {
        Authorization: "Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(pageContent),
    }
  );
  const result = await response.json();
  return result;
}
