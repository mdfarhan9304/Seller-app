import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  ImageSourcePropType,
} from "react-native";

// Define the type for carousel data
type CarouselItem = {
  id: string;
  imageSource: ImageSourcePropType;
};
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const Carousel = () => {
  const flatlistRef = useRef<FlatList<CarouselItem>>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeIndex === carouselData.length - 1) {
        flatlistRef.current?.scrollToIndex({
          index: 0,
          animated: true,
        });
        setActiveIndex(0);
      } else {
        flatlistRef.current?.scrollToIndex({
          index: activeIndex + 1,
          animated: true,
        });
        setActiveIndex(activeIndex + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // Get item layout for FlatList
  const getItemLayout = (
    data: ArrayLike<CarouselItem> | null | undefined,
    index: number
  ) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  // Data for carousel with images
  const carouselData: CarouselItem[] = [
    {
      id: "01",
      imageSource: require("@/assets/images/testt.png"), // Replace with your actual image paths
    },
    {
      id: "02",
      imageSource: require("@/assets/images/testt.png"),
    },
    {
      id: "03",
      imageSource: require("@/assets/images/testt.png"),
    },
  ];

  // Render each image in the carousel
  const renderItem = ({ item }: { item: CarouselItem }) => {
    return (
      <View style={{ width: screenWidth }}>
        <Image
          source={item.imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  };

  // Handle scroll event
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setActiveIndex(index);
  };

  // Render dot indicators with yellow and purple colors
  const renderDotIndicators = () => {
    return carouselData.map((_, index) => {
      const isActive = activeIndex === index;
      return (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: isActive ? "#9932CC" : "#FFD700" }, // Purple when active, Yellow when inactive
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={carouselData}
        ref={flatlistRef}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        pagingEnabled={true}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.dotsContainer}>{renderDotIndicators()}</View>
    </View>
  );
};

export default Carousel;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
  },
  image: {
    height: 165,
    width: 268,
    marginHorizontal: "auto",
    marginTop: screenHeight * 0.04,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
});
