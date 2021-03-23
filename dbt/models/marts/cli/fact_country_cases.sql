{{ config(
    dist = 'country_k',
    sort = 'dt'
) }}

WITH base_stats AS (

    SELECT
        country_k,
        dt,
        SUM(new_cases) AS new_cases,
        SUM(new_deaths) AS new_deaths,
        SUM(new_recoveries) AS new_recoveries,
        SUM(cume_cases) AS cume_cases,
        SUM(cume_deaths) AS cume_deaths,
        SUM(cume_recoveries) AS cume_recoveries
    FROM
        {{ ref('fact_cases') }} AS ca
        INNER JOIN {{ ref('dim_country') }} AS co USING (country_k)
    GROUP BY
        country_k,
        dt
)
SELECT
    country_k,
    dt,
    new_cases,
    new_deaths,
    new_recoveries,
    1e6 * new_cases / "population" :: FLOAT AS new_cases_per_million,
    1e6 * new_deaths / "population" :: FLOAT AS new_deaths_per_million,
    1e6 * new_recoveries / "population" :: FLOAT AS new_recoveries_per_million,
    cume_cases,
    cume_deaths,
    cume_recoveries,
    1e6 * cume_cases / "population" :: FLOAT AS cume_cases_per_million,
    1e6 * cume_deaths / "population" :: FLOAT AS cume_deaths_per_million,
    1e6 * cume_recoveries / "population" :: FLOAT AS cume_recoveries_per_million,
    cume_deaths / NULLIF(
        cume_deaths + cume_recoveries,
        0
    ) :: FLOAT AS mortality_rate,
    new_cases / NULLIF(
        cume_cases - new_cases,
        0
    ) :: FLOAT pct_new_cases,
    new_deaths / NULLIF(
        cume_deaths - new_deaths,
        0
    ) :: FLOAT pct_new_deaths,
    new_recoveries / NULLIF(
        cume_recoveries - new_recoveries,
        0
    ) :: FLOAT pct_new_recoveries
FROM
    base_stats
    INNER JOIN {{ ref('dim_country') }} USING (country_k)
ORDER BY
    country_k,
    dt
