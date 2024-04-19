// import * as React from "react";
// import { View, Animated, StyleSheet, useWindowDimensions } from "react-native";
// import { TabView, SceneMap, TabBar } from "react-native-tab-view";
// import { Ionicons } from "@expo/vector-icons";

// import Friends from "../screens/home/FriendsList";
// import AddFriends from "../screens/home/AddFriends";
// import FriendRequests from "../screens/home/FriendRequests";

// const renderScene = SceneMap({
//   first: Friends,
//   second: AddFriends,
//   third: FriendRequests,
// });

// const FriendTab = () => {
//   const layout = useWindowDimensions();

//   const [index, setIndex] = React.useState(0);
//   const [routes] = React.useState([
//     { key: "first", icon: "people" },
//     { key: "second", icon: "person-add" },
//     { key: "third", icon: "mail" },
//   ]);

//   // const renderIcon = ({ route, focused }) => (
//   //   <Ionicons name={route.icon} size={24} color={focused ? "white" : "#0066cc"} />
//   // );
//   const inputRange = routes.map((_, i) => i);

//     const renderIcon = ({ route }) => {
//       const routeIndex = routes.findIndex((e) => e.key === route.key);
//       const color = position.interpolate({
//         inputRange,
//         outputRange: inputRange.map((i) =>
//           i === routeIndex ? "white" : "#0066cc"
//         ),
//       });

//       return (
//         <Animated.View>
//           <Ionicons name={route.icon} size={24} style={{ color }} />
//         </Animated.View>
//       );
//     };

//   const renderIndicator = (props) => {
//     const { position, navigationState, getTabWidth } = props;
//     const width = layout.width / navigationState.routes.length;
//     // const width = layout.width / routes.length;

//     const translateX = Animated.multiply(position, width - 18);

//     // const translateX = Animated.multiply(position, new Animated.Value(width));

//     return (
//       <Animated.View
//         style={{
//           position: "absolute",
//           // padding: "10%",
//           width: width, // Circle's width as a third of each tab's width
//           height: "100%", // Circle's height
//           borderRadius: 25, // Half of height to make it a perfect circle
//           backgroundColor: "#0066cc",
//           transform: [{ translateX }],
//           shadowColor: "#000",
//           shadowOpacity: 0.2,
//           shadowOffset: { width: 0, height: 2 },
//           shadowRadius: 4,
//         }}
//       />
//     );
//   };

//   const renderTabBar = (props) => (
//     <TabBar
//       {...props}
//       renderIcon={({ route }) =>
//         renderIcon({
//           route,
//           focused: index === routes.findIndex((e) => e.key === route.key),
//         })
//       }
//       renderIndicator={renderIndicator}
//       indicatorStyle={{ backgroundColor: "transparent" }}
//       style={{
//         backgroundColor: "white",
//         borderRadius: 25,
//         marginHorizontal: 20,
//         overflow: "hidden",
//         elevation: 0,
//         shadowColor: "#000",
//         shadowOpacity: 0.2,
//         shadowOffset: { width: 0, height: 2 },
//         shadowRadius: 4,
//       }}
//       labelStyle={{ display: "none" }}
//       iconStyle={{ justifyContent: "center", alignItems: "center" }}
//     />
//   );

//   return (
//     <TabView
//       navigationState={{ index, routes }}
//       renderScene={renderScene}
//       onIndexChange={setIndex}
//       initialLayout={{ width: layout.width }}
//       renderTabBar={renderTabBar}
//       style={{ marginTop: 20 }}
//     />
//   );
// };

// export default FriendTab;


import * as React from "react";
import { View, Animated, StyleSheet, useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";

import Friends from "../screens/home/FriendsList";
import AddFriends from "../screens/home/AddFriends";
import FriendRequests from "../screens/home/FriendRequests";

const renderScene = SceneMap({
  first: Friends,
  second: AddFriends,
  third: FriendRequests,
});

const FriendTab = () => {
  const layout = useWindowDimensions();
  const position = React.useRef(new Animated.Value(0)).current;

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", icon: "people" },
    { key: "second", icon: "person-add" },
    { key: "third", icon: "mail" },
  ]);

  const renderIcon = ({ route, focused }) => {
    const color = position.interpolate({
      inputRange: routes.map((_, i) => i),
      outputRange: routes.map((r) =>
        r.key === route.key ? "white" : "#4A90E2"
      ),
    });

    return (
      <Animated.Text style={{ color }}>
        <Ionicons name={route.icon} size={24} />
      </Animated.Text>
    );
  };

  const renderIndicator = (props) => {
    const width = layout.width / routes.length;
    const translateX = position.interpolate({
      inputRange: [0, 1, 2], // Assuming you have three tabs
      outputRange: [0, width, 2 * width], // Move between multiples of tab width
    });

    return (
      <Animated.View
        style={{
          position: "absolute",
          width: width,
          height: "100%",
          borderRadius: 10,
          backgroundColor: "#4A90E2",
          transform: [{ translateX }],
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        }}
      />
    );
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      renderIcon={({ route, focused }) =>
        renderIcon({
          route,
          focused: index === routes.findIndex((e) => e.key === route.key),
        })
      }
      renderIndicator={renderIndicator}
      indicatorStyle={{ backgroundColor: "transparent" }}
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        marginHorizontal: 20,
        overflow: "hidden",
        elevation: 0,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      }}
      labelStyle={{ display: "none" }}
      iconStyle={{ justifyContent: "center", alignItems: "center" }}
    />
  );

  React.useEffect(() => {
    const listener = position.addListener(({ value }) => {
      // console.log("Position Value: ", value); // You can see the animated value on change
    });

    return () => {
      position.removeListener(listener);
    };
  }, []);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={(index) => {
        setIndex(index);
        Animated.spring(position, {
          toValue: index,
          useNativeDriver: true,
          speed: 10, // Control the speed of the animation
          bounciness: 10, // This prop will add the bounce effect to the sliding animation
        }).start();
      }}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      style={{ marginTop: 20 }}
    />
  );
};

export default FriendTab;
