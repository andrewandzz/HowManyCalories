<?php

if (isset($_GET['name'])) $name = $_GET['name'];
else $name = 'Unnamed';

if (isset($_GET['email'])) $email = $_GET['email'];
else $email = 'no e-mail';

$message = 'Hello, Andrew';

mail('andrewandzz1@gmail.com', 'HowManyCalories', $message);

?>