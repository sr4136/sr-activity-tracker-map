<?php
$gpx_directory = 'gpx';
$all_filenames = scandir($gpx_directory);

if ($all_filenames) :

	// Remove the directory traversers (`.` and `..`).
	$gpx_filenames = array_diff($all_filenames, array('..', '.'));

	// Add full path.
	foreach( $gpx_filenames as $index => $filename ){
		$gpx_filenames[$index] = 'https://steverudolfi.com/_misc/srunkeeper/gpx/' . $gpx_filenames[$index];
	}

	// Reduce array to values only.
	$gpx_filenames = array_values($gpx_filenames);
?>
	<script>
		var gpx_files = <?php echo json_encode($gpx_filenames); ?>;
	</script>
<?php
endif;
?>