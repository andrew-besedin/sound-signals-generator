import { MonophonicContent } from "../MonophonicContent";
import { PolyphonicContent } from "../PolyphonicContent";
import { GenerateVariant, type ContentProps } from "./Content.types";

export function Content({
  generateVariant,
}: ContentProps) {
  switch (generateVariant) {
    case GenerateVariant.monophonic:
      return <MonophonicContent />;
    case GenerateVariant.polyphonic:
      return <PolyphonicContent />;
    case GenerateVariant.modulated:
      return null;
  }
}