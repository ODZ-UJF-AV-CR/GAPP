import type { Signal } from '@angular/core';
import type { FilterSpecification, LineLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl';

type LayerBase<T extends SymbolLayerSpecification | LineLayerSpecification> = {
    layerId: string;
    type: T['type'];
    layout?: T['layout'];
    paint?: T['paint'];
    filter?: FilterSpecification;
    data: Signal<GeoJSON.FeatureCollection>;
};

export type SymbolLayer = LayerBase<SymbolLayerSpecification>;
export type LineLayer = LayerBase<LineLayerSpecification>;
export type Layer = SymbolLayer | LineLayer;
