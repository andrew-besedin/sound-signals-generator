import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import './App.css'
import { ContentContainer, WrappedInnerContainer, WrappedOuterContainer } from './App.styles';
import { useState } from 'react';
import { GenerateVariants, type ContentProps } from './App.types';

function MonophonicContent() {
  return (
    <ContentContainer>
      <Typography>Monophonic</Typography>
    </ContentContainer>
  );
}

function Content({
  generateVariant,
}: ContentProps) {
  switch (generateVariant) {
    case GenerateVariants.monophonic:
      return <MonophonicContent />;
    case GenerateVariants.polyphonic:
      return null;
    case GenerateVariants.modulated:
      return null;
  }
}

function App() {
  const [generateVariant, setGenerateVariant] = useState<GenerateVariants>(GenerateVariants.monophonic);

  return (
    <WrappedOuterContainer>
      <WrappedInnerContainer>
        <Typography variant="h4" component="h1">
          Sound Signals Generator
        </Typography>
        <ToggleButtonGroup
          value={generateVariant}
          onChange={(_, value) => setGenerateVariant(value as GenerateVariants)}
          exclusive
          sx={{ width: '100%' }}
        >
          <ToggleButton
            value={GenerateVariants.monophonic}
            sx={{ flex: 1 }}
          >
            Monophonic
          </ToggleButton>
          <ToggleButton
            value={GenerateVariants.polyphonic}
            sx={{ flex: 1 }}
          >
            Polyphonic
          </ToggleButton>
          <ToggleButton
            value={GenerateVariants.modulated}
            sx={{ flex: 1 }}
          >
            Modulated
          </ToggleButton>
        </ToggleButtonGroup>
        <Content generateVariant={generateVariant} />
      </WrappedInnerContainer>
    </WrappedOuterContainer>
  )
}

export default App
