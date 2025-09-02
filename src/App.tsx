import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';

import './App.css'
import { WrappedInnerContainer, WrappedOuterContainer } from './App.styles';
import { Content, GenerateVariant } from './components/Content';

function App() {
  const [generateVariant, setGenerateVariant] = useState<GenerateVariant>(GenerateVariant.monophonic);


  const onGenerateVariantChange = (_: React.MouseEvent<HTMLElement>, value: GenerateVariant) => {
    if (value === null) return;
    setGenerateVariant(value);
  }

  return (
    <WrappedOuterContainer>
      <WrappedInnerContainer>
        <Typography variant="h4" component="h1">
          Sound Signals Generator
        </Typography>
        <ToggleButtonGroup
          value={generateVariant}
          onChange={onGenerateVariantChange}
          exclusive
          sx={{ width: '100%' }}
        >
          <ToggleButton
            value={GenerateVariant.monophonic}
            sx={{ flex: 1 }}
          >
            Monophonic
          </ToggleButton>
          <ToggleButton
            value={GenerateVariant.polyphonic}
            sx={{ flex: 1 }}
          >
            Polyphonic
          </ToggleButton>
          <ToggleButton
            value={GenerateVariant.modulated}
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
