import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { system } from '../theme';

export const renderWithChakra = (ui: ReactElement): ReturnType<typeof render> =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>);
