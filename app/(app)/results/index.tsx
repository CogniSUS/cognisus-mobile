import { router, useFocusEffect } from "expo-router";

export default function ResultsPage() {
  useFocusEffect(() => {
      router.replace("/results/resultado");
    });

    return null;
}

