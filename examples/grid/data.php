<?php

$data = array();
$names = array('Tom', 'Kate', 'Patric', 'Adam', 'Amanda', 'Pati', 'John', 'Al', 'Carol', 'Kenny', 'Oi');
$countries = array('Poland', 'USA', 'Iraq', 'Germany', 'Japan', 'China', 'France', 'Ukraine', 'Canada');
$namesNumber = count($names) - 1;
$countriesNumber = count($countries) - 1;
$len = 500;

for ($i = 0; $i < $len; $i++)
{
    $data[] = array(
        'id'        => $i,
        'name'      => $names[rand(0, $namesNumber)],
        'country'   => $countries[rand(0, $countriesNumber)],
        'average'   => rand(0, 5000)
    );
}

header('Content-Type: application/json');
echo json_encode($data);