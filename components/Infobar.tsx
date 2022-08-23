import React from 'react'
import { Heading, Text, VStack } from '@chakra-ui/react'
import Card from 'components/Card'
import LeftContainer from './LeftContainer'
import { useMode } from 'hooks/useMode'

const Infobar: React.FC = () => {
  const [mode] = useMode()

  return mode === 'default' ? (
    <LeftContainer>
      <Card>
        <VStack>
          <Heading size="md">Route-based application of Floyd-Warshall Algorithm Demo</Heading>
        </VStack>
      </Card>
    </LeftContainer>
  ) : (<></>)
}

export default Infobar
