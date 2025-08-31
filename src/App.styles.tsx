import { Box, styled } from "@mui/material";

export const WrappedOuterContainer = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const WrappedInnerContainer = styled(Box)({
  width: '100%',
  maxWidth: 500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 20,
  paddingTop: 20,
  paddingBottom: 20,
});

export const ContentContainer = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 20,
});