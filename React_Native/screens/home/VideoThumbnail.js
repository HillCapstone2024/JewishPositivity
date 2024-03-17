// import React, { useState } from "react";
// import { View, Image, Button } from "react-native";
// import { createThumbnail } from "react-native-create-thumbnail";

// const VideoThumbnail = ({ videoUri }) => {
//   const [thumbnailUri, setThumbnailUri] = useState("");

//   const generateThumbnail = async () => {
//     try {
//       const response = await createThumbnail({
//         url: videoUri,
//         timeStamp: 10000, // Time in milliseconds to grab the frame (e.g., 10000 for the 10th second)
//       });
//       console.log("Thumbnail created", response.path);
//       setThumbnailUri(response.path);
//     } catch (err) {
//       console.error("Error generating thumbnail", err);
//     }
//   };

//   return (
//     <View>
//       <Button title="Generate Thumbnail" onPress={generateThumbnail} />
//       {thumbnailUri ? (
//         <Image
//           source={{ uri: thumbnailUri }}
//           style={{ width: 100, height: 100 }}
//         />
//       ) : null}
//     </View>
//   );
// };

// export default VideoThumbnail;
