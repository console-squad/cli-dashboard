WITH country_population AS (
    SELECT
        iso3,
        SUM("population") AS "population"
    FROM
        cli_dashboard.uid_iso_fips_lookup
    GROUP BY
        iso3
)
SELECT
    {{ dbt_utils.surrogate_key(['country_region']) }} AS country_k,
    country_region AS "name",
    iso2,
    iso3,
    lat,
    long_ AS lon,
    cp."population"
FROM
    {{ ref('uid_iso_fips_lookup') }} AS lookup
    INNER JOIN country_population AS cp USING (iso3)
WHERE
    lookup.province_state IS NULL
ORDER BY
    country_k
