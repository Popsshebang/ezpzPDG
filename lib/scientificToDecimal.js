
// -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// dxf files (seem) to use scientific notation only for very small numbers.
// ex. "1.256048216824457e-016". Otherwise it appears that the 
// numbers are written normally.
//
// Numbers less than one are prefixed with a zero ie.  0.12345
// In some circumstances JS will assume a leading zero (0) means an Octal number.
// -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// scientificToDecimal( scientific notation string, number of decimal places);
//   Returns normal/decimal number with fixed decimal places

function scientificToDecimal($x, precision) {
	// function to convert scientific notation to standard nunmbers 
	// and set precision, ie. number of decimal places

	var $num = "";
	var $numTmp = "";
	var $numSign = "";

	$x = $x.toLowerCase(); // Force exponent to lower case "e" (if there is one)
	if ( !$x.includes("e") ){ // if no 'e', then not scientific notation
        $numTmp = Number($x);
		return $numTmp.toFixed(precision); // "toFixed" returns a string. ref W3
	}

	// strip and save leading sign. ie negative/positive
	if ( $x.charAt(0) == "-" ){ // check if negetive number and save sign.
		$numSign = "-";
		$x = $x.substring(1); // Start at chr after "-".
							  // If 'end' not specified .substring(start, end), 
							  // gets rest of string to end.
	} else {
		$numSign = "";
	}

	// see if it's <1, a small number, ie. negative exponent
	var digits = $x.split('e'); // split for digits before exponent
	var tmpDigits = digits[0].split('.');
	var intPart = tmpDigits[0];
	if (intPart == "") intPart = String.fromCharCode(48);  // chr(48) == "0"
	var decPart = tmpDigits[1];
    var ePosition = $x.search('e-');
	var $buildNum = "";
	
	// small number notation (ie. "e-")
	if ( ePosition > -1){
		 var getPower = $x.split('e-');
		 var expPower = getPower[1];
		 
		// by concatinating int and dec parts the decimal point will 
		// already be moved one position to the left.
		$buildNum = "" + intPart + "" + decPart; 
		expPower--;
		while (expPower--) $buildNum = String.fromCharCode(48) + $buildNum;
		$buildNum = $numSign + "." + $buildNum;
		
		return Number($buildNum).toFixed(precision); // "toFixed" returns a string. ref W3

		} else {
		// must be a large number. ie a positive 'exponent'
		 var getPower = $x.split('e');
		 var expPower = getPower[1];

		 expPowerTmp = expPower;

		 ePosition = $x.search('e'); // probably don't need for this part

		// add some zero's for padding
		if (expPower > 0){
			while (expPowerTmp--) decPart =  decPart + String.fromCharCode(48);
		}
		var $leftStrDecPart = decPart.substring(0, expPower);
		var $rightStrDecPart = decPart.substring(expPower);
		
		// by concatinating int and dec parts the decimal point will 
		// be moved one position to the left, so increment expPower++ to compensate
		$buildNum = "" + intPart + "" + $leftStrDecPart + "." + $rightStrDecPart; 
		$buildNum = $numSign + $buildNum;

		return Number($buildNum).toFixed(precision); // "toFixed" returns a string. ref W3
	}
}

/*
$num = "1.256048216824457e-016";
$num = "0.256048216824457e-016";
$num = "-0.256048e-03";
//$num = "-0.256048e-01";
//$num = "-.256048e-02";
$num = "1.256048e-06";
//$num = "1.234567";
$num = "-1.234567";
$num = "-3.57096e3";
$num = "256048216824457";

if ( $num.length > 0 ){
	$num = $num.toString(10); // try to make sure we're passing a string, radix/base 10
	                          // A leadig 0 (zero) can be read by JS as base 8 octal!

	$normNumber = convertToFixed($num, precision); 

	document.getElementById("gCodeBox").value = $normNumber;
} else {
	document.getElementById("gCodeBox").value = "Woops, must of been a blank variable?";
}
*/