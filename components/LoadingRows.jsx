import styled, { css, keyframes } from 'styled-components';

export const loadingAnimation = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const shimmerMixin = css`
  animation: ${loadingAnimation} 3.2s infinite linear;
  animation-fill-mode: both;
  background: linear-gradient(
    90deg,
    rgba(128, 128, 128, 0.2),
    rgba(128, 128, 128, 0.5) 50%,
    rgba(128, 128, 128, 0.2)
  );
  background-size: 200% 100%;
`;

export const BaseLoadingRows = styled.div`
  display: grid;

  & > div {
    ${shimmerMixin}
    border-radius: 12px;
    height: 2.4em;
    width: 100%;
    background-color: rgba(128, 128, 128, 0.1);
  }
`;

export const LoadingRows = styled(BaseLoadingRows)`
  padding-top: 36px;
  min-width: 75%;
  max-width: 960px;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.8em;
  grid-template-columns: repeat(3, 1fr);
  padding: 8px;
  margin: auto; // to center horizontally

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 3;
  }
  & > div:nth-child(4n) {
    grid-column: 3 / 4;
    margin-bottom: 2em;
  }
`;

export function LoadingLines() {
  return (
    <div className="flex flex-col items-center justify-center">
      <LoadingRows>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </LoadingRows>
    </div>
  );
}
