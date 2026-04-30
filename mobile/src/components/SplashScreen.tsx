import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

type Props = {
  onFinish: () => void;
};

const videoSource = require("../../assets/Mobile-Splash.mp4");

export default function SplashScreen({ onFinish }: Props) {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      onFinish();
    });

    return () => sub.remove();
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"// ✅ correct prop
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220", // ✅ fills top & bottom space
    justifyContent: "center",   // ✅ centers video vertically
    alignItems: "center",       // ✅ centers horizontally
  },
  video: {
    width: "100%",
    height: "100%",
  },
});