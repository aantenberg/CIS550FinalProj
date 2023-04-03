# Overview

The application we would like to create is a website where users can input a zipcode and view how many/how close fast food restaurants are to them, as well as how close they are to a Michelin star restaurant. The average income of a given zipcode will also be available, and will be used to see if there is correlation between income and number of fast food or michelin star restaurants. 

# Datasets

## Zip Code Income Dataset

[https://catalog.data.gov/dataset/zip-code-data](https://catalog.data.gov/dataset/zip-code-data)

This dataset contains detailed individual income tax return data at the state and zip code levels. It has 166,000 rows and 164 columns (too many to include, but some of them are: number of returns (approximates the number of households), number of personal exemptions (approximates the population), adjusted gross income, wages and salaries, dividends before exclusion, and interest received).   

## Fast Food Locations Dataset

[https://www.kaggle.com/datasets/datafiniti/fast-food-restaurants?select=FastFoodRestaurants.csv](https://www.kaggle.com/datasets/datafiniti/fast-food-restaurants?select=FastFoodRestaurants.csv)

This dataset contains information about 9,934 fast food restaurants in the US. It has 10 columns, including their address, longitude, and latitude. We would use this dataset to find the number of fast food restaurants in a given zip code/within a certain distance from a given zip code inputted by the user.

## Michelin Restaurants Dataset

[https://www.kaggle.com/datasets/jackywang529/michelin-restaurants](https://www.kaggle.com/datasets/jackywang529/michelin-restaurants)

This dataset contains qualitative and location information about over 600 Michelin Star restaurants around the country. It has 10 columns, including the restaurant name, address, latitude and longitude, and pricing information for the restaurant. We would use this dataset to find the number of Michelin Star restaurants in a given zip code/ within a certain distance from a given zip code inputted by the user.

## Zip Code-Lat/Long Dataset

[https://gist.github.com/erichurst/7882666](https://gist.github.com/erichurst/7882666)

This dataset contains all of the zip codes in the United States, and latitude/longitude values corresponding to the location of that zip code. It has 32,914 rows and 3 columns (zip, latitude, longitude.) We would use this dataset to find all of the addresses present in the real estate sales dataset within a certain range of a given zip code.

# Queries

1. Find the average income within a certain distance of a given zip code. 
2. Find all zipcodes where there are only fast food restaurants and no Michelin star restaurants
3. Sort the zipcodes by ratio of Michelin star to Fast food restaurants, and output the top 20 zipcodes, as well as the average income for the zipcode
4. Find all restaurants (fast food or Michelin) within a certain range of a zip code
5. Find the zip codes with high incomes but no Michelin star restaurants

# Exploratory Data Analysis

As some quick EDA, we opened the Michelin Star dataset in Pandas. The first thing we noticed was that the “Price” column was a string of the form “$$$,” representing how relatively expensive the restaurant is. To make this information easier to query over, we created a num_dollar_signs column in the DataFrame using the length of the price string:

```python
dataframe['num_dollar_signs'] = dataframe['price'].apply(len)
```

Now that we have a number of dollar signs, we can explore. The one Michelin Star restaurants had the following statistics:

| index | year | latitude | longitude | num_dollar_signs |
| --- | --- | --- | --- | --- |
| count | 259.0 | 259.0 | 259.0 | 259.0 |
| mean | 2019.0 | 38.84078055598456 | -44.64119885019305 | 3.552123552123552 |
| std | 0.0 | 17.920522952072442 | 70.12844054870398 | 0.9065787378554163 |
| min | 2019.0 | -23.634005 | -122.88647 | 1.0 |
| 25% | 2019.0 | 37.751989 | -117.9982775 | 3.0 |
| 50% | 2019.0 | 40.724194 | -73.98357 | 4.0 |
| 75% | 2019.0 | 47.80343 | 12.591601 | 4.0 |
| max | 2019.0 | 63.43392 | 121.56771 | 5.0 |

For the two star restaurants:

| index | year | latitude | longitude | num_dollar_signs |
| --- | --- | --- | --- | --- |
| count | 57.0 | 57.0 | 57.0 | 57.0 |
| mean | 2019.0 | 38.81756022807018 | -39.09546919298245 | 4.105263157894737 |
| std | 0.0 | 17.439467818051796 | 72.33420909624287 | 0.5569114614908277 |
| min | 2019.0 | -23.56618 | -122.42131 | 2.0 |
| 25% | 2019.0 | 37.75555 | -87.64513 | 4.0 |
| 50% | 2019.0 | 40.721832 | -73.96745 | 4.0 |
| 75% | 2019.0 | 47.83636 | 13.29337 | 4.0 |
| max | 2019.0 | 63.43626 | 121.559525 | 5.0 |

And finally, for the three star restaurants:

| index | year | latitude | longitude | num_dollar_signs |
| --- | --- | --- | --- | --- |
| count | 19.0 | 19.0 | 19.0 | 19.0 |
| mean | 2019.0 | 42.03966842105263 | -63.86226510526316 | 3.9473684210526314 |
| std | 0.0 | 8.388170431207216 | 68.39669132205664 | 0.5242650104380328 |
| min | 2019.0 | 25.049496 | -122.869705 | 2.0 |
| 25% | 2019.0 | 38.101389999999995 | -122.38175 | 4.0 |
| 50% | 2019.0 | 40.68872 | -73.98712 | 4.0 |
| 75% | 2019.0 | 41.340914999999995 | -31.610911 | 4.0 |
| max | 2019.0 | 59.910477 | 121.51674 | 5.0 |

The ZIP Code Income Dataset, because it is maintained by the IRS, is very clean and ready for querying. Also, there are 150 columns of information about income and taxes. For the sake of this EDA, we focused on three. Here are some statistics about those attributes:

| index | Adjust Gross Income | Total Income Amount | Taxable Income Amount |
| --- | --- | --- | --- |
| count | 67745.0 | 67745.0 | 67744.0 |
| mean | 183,924.6084581888 | 185,987.35529420772 | 140,849.35358112896 |
| std | 4673215.470459915 | 4721656.615264486 | 4028967.8117975323 |
| min | 0.0 | 0.0 | 0.0 |
| 25% | 5132.0 | 5200.0 | 2559.0 |
| 50% | 20987.0 | 21,260.0 | 11472.0 |
| 75% | 84962.0 | 86,088.0 | 55528.5 |
| max | 883,901,532.0 | 892,852,081.0 | 794,421,523.0 |
