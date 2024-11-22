import React, { useState, useEffect } from "react";
import "./App.css";
import { toast, ToastContainer } from "react-toastify";
import { Carousel } from "react-responsive-carousel";
import AuthModal from "./components/signup";

function SearchPage() {
  const [activeTab, setActiveTab] = useState("scrape"); // Tab state
  const BASE_URL = "https://olostep-eb5687f86578.herokuapp.com";

  // const BASE_URL = "http://localhost:3001";
  const [labels, setLabels] = useState([]);
  const [summary, setSummary] = useState("");
  const [history, setHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState("");
  const [url, setUrl] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [historyRefresher, setHistoryRefresher] = useState(false);
  const [images, setImages] = useState([]);
  const [useFullLinks, setUseFullLinks] = useState(false);
  const [relatedContent, setRelatedContent] = useState([]);
  const [fetchingSummary, setFetchingSummary] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // On the client side (React)
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove the JWT token
    // Optionally, you can redirect the user to the login page
    window.location.href = "/login";
  };

  const getHistory = async () => {
    check();

    try {
      const response = await fetch(`${BASE_URL}/scrape/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        toast.error("There was a problem with history fetch operation");
        return;
      }
      const data = await response.json();
      setHistory(data);
      console.log(data);
    } catch (error) {
      console.error("There was scrapping data. IA error", error);
    }
  };

  const isExipred = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verifyToken`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        toast.error("Session expired, please login again");
        return true;
      }
      const data = await response.json();

      console.log("data", data);

      if (data.message === "Token is valid") {
        console.log("token is valid");
        return false;
      }
      return true;
    } catch (error) {
      console.error("There was a problem with the verify operation:", error);
      return true;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      setUser(localStorage.getItem("authToken"));
    }
  }, [isModalOpen]);

  const check = async () => {
    const expired = await isExipred();
    if (expired) {
      handleLogout();
    }
  };
  useEffect(() => {
    if (!user && !localStorage.getItem("authToken")) return;

    check();

    setUser(localStorage.getItem("authToken"));
    console.log("getting history");
    getHistory();
  }, [user, historyRefresher]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      openModal();
      return;
    }

    if (!url) {
      alert("Please enter a valid URL");
      return;
    }

    check();

    setFetchingSummary(true);
    try {
      const response = await fetch(`${BASE_URL}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
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

      const labeledColors = website.labels.map((label) => ({
        text: label,
        color: generateRandomColor(),
      }));

      setWebsiteName(website.websiteName);
      setLabels(labeledColors);
      setRelatedContent(website.relatedContent);
      setKeyPoints(website.keyPoints);
      setImages(website.images);
      setHistoryRefresher(!historyRefresher);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      toast.error("There was a problem with the fetch operation");
    } finally {
      setFetchingSummary(false);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/scrape/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        toast.error("There was a problem with the history clear operation");
        return;
      }
      toast.success("History cleared successfully");
      setHistory([]);
    } catch (error) {
      console.error(
        "There was a problem with the history clear operation:",
        error
      );
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

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg shadow-md ${
              activeTab === "scrape"
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
            onClick={() => setActiveTab("scrape")}
          >
            Scrape
          </button>

          {user && (
            <button
              className={`px-4 py-2 rounded-lg shadow-md ${
                activeTab === "history"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          )}

          {user && (
            <button
              className="px-4 py-2 rounded-lg shadow-md bg-red-500 text-white"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "scrape" && (
          <div className="w-full max-w-lg">
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
            <div className="bg-white p-6 rounded-lg shadow-lg">
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
                        <a
                          href={image.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={image.src}
                            alt={image.alt || "Image"}
                            width={"200px"}
                            height={"200px"}
                            style={{
                              objectFit: "cover",
                              width: "200px",
                              height: "200px",
                            }}
                          />
                        </a>

                        {image.alt && <p className="legend">{image.alt}</p>}
                      </div>
                    ))}
                  </Carousel>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Search History
              </h2>
              <button
                className="px-4 py-2 text-white bg-[#538392] rounded-lg shadow-md hover:bg-[#3e5b65] transition-all duration-300"
                onClick={clearHistory}
              >
                Clear
              </button>
            </div>

            {history.length > 0 ? (
              <ul className="list-disc list-inside text-blue-500">
                {history.map((item, index) => (
                  <li
                    key={index}
                    className="cursor-pointer"
                    onClick={() => {
                      setActiveTab("scrape");
                      setUrl(item.websiteLink);
                      console.log("item", item.website.website);
                    }}
                  >
                    <span className="font-semibold">{item.websiteLink}: </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No history available</p>
            )}
          </div>
        )}
      </div>
      <AuthModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

export default SearchPage;
