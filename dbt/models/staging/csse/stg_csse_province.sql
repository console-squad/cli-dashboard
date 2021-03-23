WITH provinces AS (
    SELECT
        {{ dbt_utils.surrogate_key(['combined_key']) }} AS province_k,
        co.country_k,
        lookup.combined_key AS "name",
        lookup.province_state AS province,
        lookup.country_region AS country,
        lookup.lat,
        lookup.long_ AS lon,
        lookup."population"
    FROM
        {{ ref('uid_iso_fips_lookup') }} AS lookup
        INNER JOIN {{ ref('stg_csse_country') }} AS co
        ON lookup.country_region = co."name"
    WHERE
        province_state IS NOT NULL
)
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
    (
        SELECT
            *
        FROM
            provinces
    )
UNION ALL
    (
        SELECT
            '0' AS province_k,
            NULL AS country_k,
            NULL AS "name",
            NULL AS province,
            NULL AS country,
            NULL AS lat,
            NULL AS lon,
            NULL AS "population"
    )
ORDER BY
    province_k
