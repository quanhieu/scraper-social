import { VideoResponse } from "@/pages/api/interface";
import { useMemo } from "react";
type VideoComponentProps = {
  videos: VideoResponse[];
  loading: boolean;
  loadingVideos: boolean;
  delayMessage?: string;
}

export default function VideoComponent({ 
  videos, 
  loading, 
  loadingVideos,
  delayMessage = "Loading videos..." 
}: VideoComponentProps) {
  const sortVideoByView = useMemo(() => {
    return videos.sort((a, b) => b.viewCount - a.viewCount);
  }, [videos]);

  return (
    <div className="pt-0">
      {!loading && loadingVideos && (
        <div className="text-center p-4 pt-0">
          <p className="text-lg font-semibold">{delayMessage}</p>
        </div>
      )}
      
      {!loading && !loadingVideos && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-0">
          {sortVideoByView.map((video: VideoResponse) => (
            <div 
              key={video._id}
              onClick={() => {
                window.open(video.videoUrl, "_blank");
              }}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <img 
                src={video.thumbnails} 
                alt={video.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 truncate">{video.title}</h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Views:</span> {video.viewCount}</p>
                  <p><span className="font-medium">Likes:</span> {video.likeCount}</p>
                  <p><span className="font-medium">Comments:</span> {video.commentCount}</p>
                  <p><span className="font-medium">Favorites:</span> {video.favoriteCount}</p>
                  <p className="col-span-2"><span className="font-medium">Avg Interaction:</span> {video.averageInteraction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}