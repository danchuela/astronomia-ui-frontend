declare module "aladin-lite" {
  interface AladinOptions {
    survey?: string;
    fov?: number;
    target?: string;
    projection?: string;
    showReticle?: boolean;
    showZoomControl?: boolean;
    showLayersControl?: boolean;
    showGotoControl?: boolean;
    showFrame?: boolean;
    cooFrame?: string;
  }

  interface AladinInstance {
    gotoRaDec(ra: number, dec: number): void;
    setFoV(fovDeg: number): void;
    setBaseImageLayer(hipsIdOrUrl: string): void;
  }

  interface AladinStatic {
    init: Promise<void>;
    aladin(element: HTMLElement, options?: AladinOptions): AladinInstance;
  }

  const A: AladinStatic;
  export default A;
}
