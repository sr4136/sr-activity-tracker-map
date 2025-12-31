<!DOCTYPE html>
<html>

<head>
	<title>Activity Tracker Map</title>

	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<link rel="preconnect" href="https://fonts.bunny.net">
	<link href="https://fonts.bunny.net/css?family=alegreya-sc:800" rel="stylesheet" />
	<link rel="stylesheet" href="style-modern-normalize.css">
	<link rel="stylesheet" href="style.css">

	<link rel="icon" type="image/x-icon" href="favicon.ico">

	<?php

	// API keys file. `keys.php`is ignored by git.
	include_once 'keys.php';

	// Generated json of paths from directory containing GPX files.
	include_once('gpx_paths.php');

	?>

	<script src="map_styles.js" type="module"></script>
	<script src="map_data.js" type="module"></script>
	<script src="map_init.js" type="module"></script>

	<!-- Google Map API key restricted via domain. -->
	<script src="https://maps.googleapis.com/maps/api/js?key=<?php echo GOOGLE_MAPS_API_KEY; ?>&callback=initMap&libraries=geometry&v=weekly" defer></script>

	<script src="https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.umd.min.js"></script>
</head>

<body>
	<header>
		<h1>Activity Tracker Map</h1>

		<p id="activities-counts">
			Showing
			<span id="count-showing"></span>
			of
			<span id="count-total"></span>
		</p>
	</header>
	<main>
		<aside id="legend">

			<section id="dates">
				<h2>Filter by Date:</h2>
				<div id="datepicker-wrapper" class="input-wrapper">
					<input type="text" autocomplete="off" id="datepicker" placeholder="Click to select date(s)" />
					<button id="datepicker-reset">&orarr;</button>
				</div>
				<p id="datepicker-alert" class="hidden">No activities found for date(s) selected.</p>
			</section>

			<section id="activity-types">
				<h2>Filter by Type:</h2>
				<ul></ul>
			</section>

			<section id="other-options">
				<h2>View Options:</h2>
				<div id="show-listing" class="option-set">
					<label for="check-listing">
						<input class="input" type="checkbox" id="check-listing" />
						<div class="toggle-wrapper">
							<span class="toggler"></span>
						</div>
						<div class="toggle-text">Show activity list.</div>
					</label>
				</div>
				<div id="suppress-infowindows" class="option-set">
					<label for="check-suppress">
						<input class="input" type="checkbox" id="check-suppress" />
						<div class="toggle-wrapper">
							<span class="toggler"></span>
						</div>
						<div class="toggle-text">Suppress info windows.</div>
					</label>
				</div>
				<div id="highlight-latest" class="option-set">
					<label for="check-latest">
						<input class="input" type="checkbox" id="check-latest" />
						<div class="toggle-wrapper">
							<span class="toggler"></span>
						</div>
						<div class="toggle-text">Highlight latest activity.</div>
					</label>
				</div>
				<div id="custom-mapstyle" class="option-set">
					<label for="check-default-style">
						<input class="input" type="checkbox" id="check-default-style" />
						<div class="toggle-wrapper">
							<span class="toggler"></span>
						</div>
						<div class="toggle-text">Use default map styles.</div>
					</label>
				</div>
				<div id="current-location" class="option-set">
					<label for="check-location">
						<input class="input" type="checkbox" id="check-location" />
						<div class="toggle-wrapper">
							<span class="toggler"></span>
						</div>
						<div class="toggle-text">Show live location (updates).</div>
					</label>
				</div>
				<div id="move-options">
					<h2>Move Map:</h2>
					<div id="searchbox-wrapper" class="option-set input-wrapper">
						<input type="text" id="searchbox" placeholder="Search" />
						<button id="searchbox-go">&crarr;</button>
					</div>
				</div>
			</section>

		</aside>

		<section id="main">
			<div id="map"></div>
			<div id="listing-container">
				<h2>Activity Listing:</h2>
				<ul id="listing"></ul>
			</div>
		</section>
	</main>
</body>

</html>