declare module "aladin-lite" {
  interface AladinOptions {
    log?: boolean;
    survey?: string | string[];
    fov?: number;
    target?: string;
    projection?: string;
    showReticle?: boolean;
    showZoomControl?: boolean;
    showFov?: boolean;
    showLayersControl?: boolean;
    showGotoControl?: boolean;
    showFrame?: boolean;
    cooFrame?: string;
  }

  export interface AladinImageLayer {
    id: string;
    query: Promise<unknown>;
    readPixel(x: number, y: number): number[] | null;
  }

  export interface AladinInstance {
    gotoRaDec(ra: number, dec: number): void;
    setFoV(fovDeg: number): void;
    setBaseImageLayer(layer: string | AladinImageLayer): void;
    removeImageLayer(layer: string): void;
    getBaseImageLayer(): AladinImageLayer | undefined;
    getRaDec(): [number, number];
    getFov(): [number, number];
    getRotation(): number;
    wasm: {
      getNOrder(): number;
      getVisibleCells(order: number): { ipix: number }[];
      isRendering(): boolean;
    };
  }

  export interface AladinStatic {
    init: Promise<void>;
    aladin(element: HTMLElement, options?: AladinOptions): AladinInstance;
    HiPS(id: string, options: {
      name: string; url: string; creatorDid: string; imgFormat: 'jpeg' | 'png';
    }): AladinImageLayer;
  }

  const A: AladinStatic;
  export default A;
}
