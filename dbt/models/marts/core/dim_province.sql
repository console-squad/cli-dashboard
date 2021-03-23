{{ config(
    dist = 'all'
) }}

SELECT
    province_k,
    country_k,
    "name",
    province,
    country,
    lat,
    lon,
    "population"
FROM
    {{ ref('stg_csse_province') }}
