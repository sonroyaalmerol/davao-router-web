import React from 'react'
import { useMap } from 'react-map-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { useMode } from 'hooks/useMode'

// @ts-ignore
import StaticMode from '@mapbox/mapbox-gl-draw-static-mode'

type CreateEvent = (evt: {features: object[]}) => void;
type UpdateEvent = (evt: {features: object[]; action: string}) => void;
type DeleteEvent = (evt: {features: object[]}) => void;

type Mode = 'default' | 'source' | 'destination'

const useDraw: () => {
  draw: MapboxDraw,
  changeMode: (mode: Mode) => void,
  mode: Mode,
  routes: any[]
} = () => {
  const map = useMap()

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [source, setSource] = React.useState<any[]>([]);
  const [destination, setDestination] = React.useState<any[]>([]);
  const [routes, setRoutes] = React.useState<any[]>([]);

  const stringToColour = (str: string) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

  React.useEffect(() => {
    if (source?.length > 0 && destination?.length > 0) {
      const sourceCoord = [source[0].geometry.coordinates[1], source[0].geometry.coordinates[0]]
      const destinationCoord = [destination[0].geometry.coordinates[1], destination[0].geometry.coordinates[0]]
      fetch(`https://davao-backend.snry.xyz/find?src=${sourceCoord.join(',')}&dest=${destinationCoord.join(',')}`).then((i) => i.json())
        .then((res) => {
          const possibleRoutes = res.map((collection: any, i: number) => ({ ...collection, features: collection.features.map((feature: any) => {
            return ({ ...feature, properties: { ...feature.properties, color: stringToColour(`${i}`) } })
          }) }))
          setRoutes(possibleRoutes);
          console.log(possibleRoutes)
          draw.deleteAll();
          draw.add(source[0]);
          draw.add(destination[0]);
          if (possibleRoutes.length > 0) {
            draw.add(possibleRoutes[0]);
          }
          setCurrentIndex(0);
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, destination]);

  const [mode, setMode] = useMode()

  const draw = React.useMemo(() => new MapboxDraw({
    displayControlsDefault: false,
    modes: {
      ...MapboxDraw.modes,
      static: StaticMode
    }
  }), [])

  const onCreate: CreateEvent = React.useCallback((e) => {
    if (mode === 'source') {
      if (source[0]?.id) {
        draw.delete(source[0].id);
      }
      setSource(e.features);
    } else if (mode === 'destination') {
      if (destination[0]?.id) {
        draw.delete(destination[0].id);
      }
      setDestination(e.features);
    }
    console.log(e)
  }, [mode, source, destination, draw])

  const onUpdate: UpdateEvent = React.useCallback((e) => {
    console.log(e)
  }, [])

  const onDelete: DeleteEvent = React.useCallback((e) => {
    console.log(e)
  }, [])

  React.useEffect(() => {
    const current = map.current
    current?.addControl(draw)
    return () => {
      current?.removeControl(draw)
    }
  }, [draw, map])

  const changeMode = React.useCallback((mode: Mode) => {
    setMode(mode)
    switch (mode) {
      case 'source':
      case 'destination':
        draw.changeMode('draw_point');
        break
      default:
        draw.changeMode('simple_select')
    }
  }, [draw, setMode])

  React.useEffect(() => {
    const ready = () => {

    }
    const updateMode = ({ mode }: { mode: string }) => {
      if (mode === 'simple_select' || mode === 'direct_select' || mode === 'static') {
        changeMode('default')
      }
    }
    const current = map.current
    if (current) {
      current?.on('load', ready)
      current?.on('draw.create', onCreate)
      current?.on('draw.update', onUpdate)
      current?.on('draw.delete', onDelete)
      current?.on('draw.modechange', updateMode)
    }
    return () => {
      if (current) {
        current?.off('load', ready)
        current?.off('draw.create', onCreate)
        current?.off('draw.update', onUpdate)
        current?.off('draw.delete', onDelete)
        current?.off('draw.modechange', updateMode)
      }
    }
  }, [changeMode, map, onCreate, onDelete, onUpdate])

  return {
    draw,
    changeMode,
    mode,
    routes
  }
}

export default useDraw
