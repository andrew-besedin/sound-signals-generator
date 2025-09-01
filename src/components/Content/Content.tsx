import { MonophonicContent } from "../MonophonicContent";
import { GenerateVariant, type ContentProps } from "./Content.types";

export function Content({
  generateVariant,
}: ContentProps) {
  switch (generateVariant) {
    case GenerateVariant.monophonic:
      return <MonophonicContent />;
    case GenerateVariant.polyphonic:
      return null;
    case GenerateVariant.modulated:
      return null;
  }
}