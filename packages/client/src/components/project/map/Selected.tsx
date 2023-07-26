import { FC, useMemo, useEffect, useState, useCallback } from "react";
import { Marker, Popup } from "react-map-gl";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { useLocale, useT } from "@transifex/react";

import { LassoSourceImage } from "@lasso/dataprep";
import { getI18NText } from "../../../utils/i18n";
import { useCurrentProject } from "../../../hooks/useCurrentProject";
import { FeatureDataPanel } from "./FeatureDataPanel";

export const Selected: FC<{ mapId: "left" | "right" }> = ({ mapId }) => {
  const locale = useLocale();
  const t = useT();
  const { project, setProjectMapSelection } = useCurrentProject();
  const selected = useMemo(() => project.maps[mapId].selected, [project, mapId]);
  const [images, setImages] = useState<Array<LassoSourceImage>>([]);
  const [opened, setOpened] = useState<boolean>(true);
  const [imageIndex, setImageIndex] = useState<number>(0);

  const removeSelection = useCallback(() => {
    setProjectMapSelection(mapId, undefined);
  }, [mapId, setProjectMapSelection]);

  useEffect(() => {
    setOpened(true);
    if (selected && selected.feature.properties) {
      setImages(selected.feature.properties["images"] || []);
    } else {
      setImages([]);
    }
    setImageIndex(0);
  }, [selected]);

  return (
    <>
      {selected && (
        <>
          <FeatureDataPanel
            mapId={mapId}
            feature={selected.feature}
            timeSpecification={project.data.sources[selected.source].timeSeries}
            onClose={removeSelection}
          />
          <Marker longitude={selected.clickedAt.lng} latitude={selected.clickedAt.lat} />
          {opened && images.length > 0 && (
            <Popup
              anchor="top"
              longitude={selected.clickedAt.lng}
              latitude={selected.clickedAt.lat}
              onClose={() => setOpened(false)}
              maxWidth={"50%"}
            >
              <div className="d-flex flex-column">
                {images.length > 0 && (
                  <div className="d-flex justify-content-center mb-3">
                    <button
                      className="btn btn-primary mx-1"
                      title={t("Previous image")}
                      disabled={imageIndex === 0}
                      onClick={() => {
                        if (imageIndex > 0) {
                          setImageIndex(imageIndex - 1);
                        }
                      }}
                    >
                      <BsChevronCompactLeft />
                    </button>
                    <button
                      className="btn btn-primary mx-1"
                      title={t("Nexts image")}
                      disabled={imageIndex === images.length - 1}
                      onClick={() => {
                        if (imageIndex < images.length - 1) {
                          setImageIndex(imageIndex + 1);
                        }
                      }}
                    >
                      <BsChevronCompactRight />
                    </button>
                  </div>
                )}
                <div>
                  <img
                    className="img-fluid"
                    src={`/data/${project.data.id}/assets/${images[imageIndex].path}`}
                    alt={getI18NText(locale, images[imageIndex].description)}
                  />
                  {images[imageIndex].description && (
                    <p className="text-center mb-0">{getI18NText(locale, images[imageIndex].description)}</p>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </>
      )}
    </>
  );
};
