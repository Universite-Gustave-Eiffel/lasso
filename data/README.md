# LASSO Data

One folder by project

## Project presentation

### `index.json`: project configuration

#### metadata

#### color schemes

Color schemes to be used to represent the variables on the map.
A color scheme is a list of colors which will be used to represent the value in the color space. If the variable to map is quantitative, its value will be RGB interpolated on those color segments. It its nominal, different colors will be used for each value.

```json
{
  "color_schemes": {
    "fancy_light_nominal_5": ["#e5bb99", "#9cc0ec", "#b8d8a7", "#e5afd4", "#82d8d8"],
    "pimp_green_blue_quantitative": ["#54c8a8", "#5785cb"]
  }
}
```

#### acoustic viz // emotion viz

Should we add configuration to define which variables should be used in the Viz

#### data layers

See below

### `project.md`: about page

### `sponsors.md`: sponsors page

### `bibliography.md`: references page

## Data layers

### `./layers/` GeoJson files

### layers specifications

The project's metadata must contain an array of layers which being referenced as:

- id: a unique (in the project scope) identifier for this layer
- layer: relative path or URL to a GeoJson file
- variable: the variable definition (see below)

Each layer points to one variable in one GeoJson.
There will be often many layers using the same GeoJson.

#### variable definition

Each variable must be described to indicate with GeoJson property should be used and what which acoustic/emotional phenomenon this variable describe.

Thus a variable must contain those descriptors:

- geojsonProperty: the property and its type in the GeoJson to be used in this layer

```json
{
  "field": "meanTra",
  "type": "quantitative",
  "scale": { "scheme": "pimp_green_blue_quantitative" }
}
```

```typescript
interface GeoJsonProperType {
  field: str;
  type: "quantitative" | "ordinal";
  scale: Scale<ExprRef | SignalRef>; //https://github.com/vega/vega-lite/blob/next/src/scale.ts#L511-L723
}
```

- origin: measure or model
- type: acoustic or emotion
- label: intensity, voices, trafic, birds, pleasant, eventfull
- unit: free text but typically "db" or "seconds"
- notes: free text to add some methodological documentation about this variable
- time_series: boolean (indicate if this variable contain a time series or is static)
- hours_labels: list of labels to display hours (if none hours are used as-is)
  ```json
    {
        "matin": {
            "label": {
              "fr":"matin",
              "en": "morning"
            },
            "hours": [8,12]
        },
        "midi": {...}
    }
  ```
- days_labels: list of labels to display days (if none days are used as-is)
  ```json
  {
      "week": {
          "label": {
            "fr":"semaine",
            "en": "working week"
          },
          "weekDays": ["monday", "tuesday", "wednesday", "thursday","friday"] ,
          "displayPosition": 0
      },
      "weekEnd": {...}
  }
  ```

### Time series specification

Time series variables must be describe into GeoJson propreties by using this format to describe the variable data points in time:

```json
[
  {
    "value": 5,
    "hours": [0, 1],
    "weekDays": ["monday", "friday"]
  }
]
```

A time series variable is an array of data points.
Each data points represent one contiguous period of time during which the variable has the same value. The contiguity is expressed with an interval of hours (two integers [0-23]) and an interval of weekdays expressed in english lowercase.
This specification aims at proving a maximum flexibility to describe concisely how a variable change: hourly but only for week-days or change by periods of hours (morning, afternoon..) but different each days, etc.

Time series are therefore express as a hourly/daily defined set of values.
To adapt the way the map will display the variable in a time line, the variable configuration into the project configuration file can specify hours and days labels.
Those labels are used to indicate which are the labels which should be used to describe the hours and days periods describe in the variable time series. It's important to be able to notify the reader that a stable value during morning hours is not a phenomenon but a data modelling artefact.
