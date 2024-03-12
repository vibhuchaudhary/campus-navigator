<?php
// Database connection parameters
$servername = "localhost"; // Change this if your MySQL server is hosted elsewhere
$username = "Anjalis-MacBook-Air.local"; // Change this to your MySQL username
$password = "password"; // Change this to your MySQL password
$database = "school_db"; // Change this to your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully to database: " . $database;
}

// Function to search for a classroom
function searchClassroom($classroom) {
    global $conn;

    $sql = "SELECT building_name, floor FROM classrooms WHERE room_number = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $classroom);
    $stmt->execute();
    $stmt->bind_result($building_name, $floor);
    $stmt->fetch();
    $stmt->close();

    return array("building_name" => $building_name, "floor" => $floor);
}

// Check if the search parameter is provided
if(isset($_GET['classroom'])) {
    $classroom = $_GET['classroom'];
    $classroomInfo = searchClassroom($classroom);
    echo json_encode($classroomInfo);
}

// Close connection
$conn->close();
?>