{{ config(
    dist = 'all'
) }}

SELECT
    country_k,
    "name",
    iso2,
    iso3,
    lat,
    lon,
    "population"
FROM
    {{ ref('stg_csse_country') }}
