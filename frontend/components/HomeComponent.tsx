import { useState } from "react";

import SearchForm from "./SearchForm";
import { VideoResponse } from "@/pages/api/interface";
import VideoComponent from "./VideoComponent";

export default function HomeComponent() {
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [delayMessage, setDelayMessage] = useState<string>("");

  return (
    <div className="flex flex-col min-h-screen pt-0">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Social Media Analysis</h1>
      </header>
      
      <div className="flex-1 flex flex-col items-center p-4 pt-0 max-w-7xl mx-auto w-full">
        <div className="w-full mb-8 flex justify-center pt-4">
          <SearchForm
            videos={videos}
            setVideos={setVideos}
            loading={loading}
            setLoading={setLoading}
            loadingVideos={loadingVideos}
            setLoadingVideos={setLoadingVideos}
            delayMessage={delayMessage}
            setDelayMessage={setDelayMessage}
          />
        </div>

        <div className="w-full">
          <VideoComponent
            videos={videos}
            loading={loading}
            loadingVideos={loadingVideos}
            delayMessage={delayMessage}
          />
        </div>
      </div>
      
      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <p>© 2025 Social Media Analysis Tool</p>
      </footer>
    </div>
  );
}

