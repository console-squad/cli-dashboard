{{ config(
    dist = 'country_k',
    sort = ['province_k', 'dt']
) }}

SELECT
    country_k,
    province_k,
    dt,
    new_cases,
    new_deaths,
    new_recoveries,
    cume_cases,
    cume_deaths,
    cume_recoveries,
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
    {{ ref('stg_csse_cases') }} AS ca
    INNER JOIN {{ ref('stg_csse_deaths') }} AS d USING (
        country_k,
        province_k,
        dt
    )
    INNER JOIN {{ ref('stg_csse_recoveries') }} AS r USING (
        country_k,
        province_k,
        dt
    )
