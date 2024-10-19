import dotenv from "dotenv";
dotenv.config();
import { OpenAI } from "openai";
import * as cheerio from "cheerio";
import { Request, Response } from "express";
import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nlp from "compromise";
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

  let textContent = $("p").text();
  textContent = textContent.replace(/\s+/g, " ").trim(); // extra space
  const words = textContent.slice(0, 500);
  console.log(words);
  return words;
}
async function fetchPageContentUsingPuppeeter(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body");
  const content = await page.evaluate(() => {
    return document.body.innerText;
  });
  await browser.close();
  console.log(content.length);
  // return content.toString().slice(0, 500);
  return content;
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
function extractFiveTags(text: string) {
  if (!(text.length > 0)) {
    throw new Error("Did not get Any text here :(");
  }
  const doc = nlp(text);
  const tags: Array<String> = doc.nouns().out("array");
  console.log(tags);
  const lowerCaseTags = tags.map((el) => el.toLowerCase());
  const filtertags = lowerCaseTags.filter((el) => el.length <= 20 && el.length > 5);
  const uniqueTags: Array<String> = [...new Set(filtertags)];
  return uniqueTags;
}
export const generateBybart = async (req: Request, res: Response) => {
  const { url } = req.body;
  try {
    const pageContent = await fetchPageContent(url);
    // const pageContent = await fetchPageContentUsingPuppeeter(url);
    console.log(pageContent.length);
    // if (pageContent.length > 550) {
    //   throw new Error("Data Set is too large");
    // }
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_BART_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(pageContent),
      }
    );
    const result = await response.json();
    const filterResult = result[0]?.summary_text;
    const tags = extractFiveTags(filterResult);
    // let tags = [];
    // if (result) {
    //   console.log(result);
    //   tags = extractFiveTags(result);
    // }

    res.status(200).json({
      status: "success",
      data: {
        result,
        tags,
        content: pageContent,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
export async function generateByGemini(req: Request, res: Response) {
  try {
    const { url } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Summarize the key content of the webpage found at ${url}  in 70 words in one paragraph. Give the output in format like Title: Content, Summary: Content, Tags:[Content]`;

    const result = await model.generateContent(prompt);
    const data = result.response.text().replace(/\\/g, "").replace(/\n/g, "");
    const summary = data.slice(
      data.indexOf("Summary:") + "Summary: ".length,
      data.indexOf("Tags:")
    );
    const title = data.slice(data.indexOf(":") + 2, data.indexOf("Summary"));
    console.log(data.indexOf("["));
    const tags = data
      .slice(data.indexOf("[") + 1, data.indexOf("]"))
      .replace(/"/g, "")
      .split(", ");
    console.log(data);
    res.status(200).json({
      status: "success",
      data: {
        summary,
        title,
        tags,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
}

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
