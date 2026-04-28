import React, { useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string; // Default video URL
  slowMoUrl?: string; // Optional slow-motion version of the video
  title?: string; // Optional title for the video
}

/**
 * VideoPlayer component for rendering exercise videos with playback speed controls.
 * Displays a single video with an optional 🐢 Turtle Mode (slow-motion toggle).
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, slowMoUrl, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element
  const [useTurtleMode, setUseTurtleMode] = useState(false); // Slow-motion mode toggle

  const displayUrl = useTurtleMode && slowMoUrl ? slowMoUrl : videoUrl;

  // Function to slow down the video using playbackRate
  const slowDown = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Slows playback to half speed
    }
  };

  // Function to reset video speed to normal
  const normalSpeed = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0; // Resets playback rate to normal
    }
  };
return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* Title */}
      {title && <h3>{title}</h3>}

      {/* Video */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 600,
          backgroundColor: "#000",
          borderRadius: 8,
          overflow: "hidden",
          margin: "0 auto 1rem",
        }}
      >
        <video
          ref={videoRef}
          key={displayUrl} // Re-render video when URL switches
          width="100%"
          height="auto"
          muted
          autoPlay
          loop
          controls
          style={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
          onError={(e) => {
            console.error("❌ Video failed to load:", displayUrl);
            console.error("Event:", e);
          }}
        >
          <source src={displayUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Speed Control Buttons */}
      <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={slowDown}
          style={{
            padding: "0.5rem 1rem",
            marginRight: "1rem",
            backgroundColor: "#f00",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Slow Down
        </button>

        <button
          type="button"
          onClick={normalSpeed}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0f0",
            color: "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Normal Speed
        </button>
      </div>

      {/* Slow Motion Toggle */}
      {slowMoUrl && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => setUseTurtleMode(!useTurtleMode)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: useTurtleMode ? "#FF9800" : "#f0f0f0",
              border: "1px solid #999",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: useTurtleMode ? 700 : 500,
              color: useTurtleMode ? "#fff" : "#000",
            }}
          >
            🐢 Turtle Mode {useTurtleMode ? "ON" : "OFF"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
