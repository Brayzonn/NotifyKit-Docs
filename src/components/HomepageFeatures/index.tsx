import type { ReactNode } from "react";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

function Feature({ title, Svg, description }: FeatureItem) {
  return <></>;
}

export default function HomepageFeatures(): ReactNode {
  return <></>;
}
