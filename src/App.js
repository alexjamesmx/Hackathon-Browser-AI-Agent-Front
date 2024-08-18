import React, { useState, useEffect } from "react";
import "./App.css";
import { toast, ToastContainer } from "react-toastify";
import { Carousel } from "react-responsive-carousel";

function SearchPage() {
  // Function to generate a random color
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const BASE_URL = "http://localhost:3001";
  const [labels, setLabels] = useState([]);
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [images, setImages] = useState([]);
  const [useFullLinks, setUseFullLinks] = useState(false);
  const [relatedContent, setRelatedContent] = useState([]);
  const [fetchingSummary, setFetchingSummary] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFetchingSummary(true);
    try {
      const response = await fetch(`${BASE_URL}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        toast.error("There was a problem with the fetch operation");
        return;
      }

      const data = await response.json();
      const website = data.website[0];

      setSummary(website.summary);
      setUseFullLinks(website.useFullLinks);

      // Assign random colors to each label
      const labeledColors = website.labels.map((label) => ({
        text: label,
        color: generateRandomColor(),
      }));

      setWebsiteName(website.websiteName);
      setLabels(labeledColors);
      setRelatedContent(website.relatedContent);
      setKeyPoints(website.keyPoints);
      setImages(website.images);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setFetchingSummary(false);
    }
  };
  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <h1 className="text-4xl font-semibold text-gray-800 mb-8">
          Easy Web Scraping
        </h1>
        <form
          className="w-full max-w-lg flex items-center mb-8"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the URL for webscraping"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={fetchingSummary}
          />
          <button
            type="submit"
            className="ml-4 px-6 py-2 text-white bg-[#538392] rounded-lg shadow-md hover:bg-[#3e5b65] transition-all duration-300"
          >
            {fetchingSummary ? <div className="loader"></div> : "Search"}
          </button>
        </form>
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
          {summary || labels.length || keyPoints.length ? (
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Summary of the website: {websiteName}
            </h2>
          ) : (
            <h2 className="text-xl text-gray-800 mb-4">
              Start searching by entering a URL
            </h2>
          )}
          <p className="text-lg text-gray-700 mb-4">{summary}</p>
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labels.map((label, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-white rounded-full"
                  style={{ backgroundColor: label.color }}
                >
                  {label.text}
                </span>
              ))}
            </div>
          )}
          {keyPoints.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Key Points
              </h2>
              <ul className="list-disc list-inside text-gray-700">
                {keyPoints.map(({ title, value }, index) => (
                  <li key={index}>
                    <span className="font-semibold">{title}: </span>
                    {value}
                  </li>
                ))}
              </ul>
            </>
          )}
          {useFullLinks.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Useful Links
              </h2>
              <ul className="list-disc list-inside text-gray-700">
                {useFullLinks.map(({ title, url }, index) => (
                  <li key={index}>
                    <span className="font-semibold">{title}: </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 break-all"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                      }}
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {relatedContent.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Related Content
              </h2>
              <ul className="list-disc list-inside text-gray-700">
                {relatedContent.map(({ title, url }, index) => (
                  <li key={index}>
                    <span className="font-semibold">{title}: </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 break-all"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                      }}
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {images.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Images
              </h2>
              <Carousel showThumbs={false} infiniteLoop={true}>
                {images.map((image, index) => (
                  <div key={index}>
                    <img
                      src={image.src}
                      alt={image.alt || "Image"}
                      width={"200px"}
                      height={"200px"}
                    />
                    {image.alt && <p className="legend">{image.alt}</p>}
                  </div>
                ))}
              </Carousel>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchPage;
