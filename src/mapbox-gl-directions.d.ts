declare module '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions' {
  import { IControl } from 'mapbox-gl';

  interface MapboxDirectionsOptions {
    accessToken: string;
    unit?: 'imperial' | 'metric';
    profile?: 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling';

    language?: string;
    placeholderOrigin?: string;
    placeholderDestination?: string;
    
    controls?: {
      inputs?: boolean;
      instructions?: boolean;
      profileSwitcher?: boolean;
    };
    interactive?: boolean;
  }

  export default class MapboxDirections implements IControl {
    [x: string]: any;
    constructor(options: MapboxDirectionsOptions);

    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(): void;

    setOrigin(origin: string | [number, number]): void;
    setDestination(destination: string | [number, number]): void;
    getOrigin(): any;
    getDestination(): any;
    removeRoutes(): void;

  }
}
