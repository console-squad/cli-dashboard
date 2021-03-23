{{ config(
    materialized = 'table',
    dist = 'country_k',
    sort = 'province_k'
) }}

WITH unpivoted AS (
    {{ dbt_utils.unpivot(
        relation = ref('time_series_covid19_confirmed_global'),
        cast_to = 'INT',
        exclude = ['province','country'],
        remove = ['lat','lon'],
        field_name = 'ymd',
        value_name = 'cases'
    ) }}
),
keyed AS (
    SELECT
        co.country_k,
        p.province_k,
        TO_DATE(
            SUBSTRING(
                up.ymd
                FROM
                    5
            ),
            'YYYYMMDD'
        ) AS dt,
        cases
    FROM
        unpivoted AS up
        INNER JOIN {{ ref('stg_csse_country') }} AS co
        ON co."name" = up.country
        LEFT JOIN {{ ref('stg_csse_province') }} AS p
        ON p.province = up.province
)
SELECT
    country_k,
    NVL(
        province_k,
        '0'
    ) AS province_k,
    dt,
    SUM(cases) AS cume_cases,
    cume_cases - LAG(cume_cases) over (
        PARTITION BY country_k,
        province_k
        ORDER BY
            dt
    ) AS new_cases
FROM
    keyed
GROUP BY
    country_k,
    province_k,
    dt
