import React from 'react'
import { VStack } from '@chakra-ui/react'
import Button from 'components/Button'
import RightContainer from './RightContainer'
import useDraw from 'hooks/useDraw'

const Toolbar: React.FC = () => {
  const { changeMode } = useDraw()

  return (
    <RightContainer>
      <VStack>
        <Button
          onClick={() => {
            changeMode('source')
          }}
          size="sm"
        >
          Add Source
        </Button>
        <Button
          onClick={() => {
            changeMode('destination')
          }}
          size="sm"
        >
          Add Destination
        </Button>
      </VStack>
    </RightContainer>
  )
}

export default Toolbar
