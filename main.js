// Global variables
var newWindow;
var xCoordArray = [];
var yCoordArray = [];
var arrayCounter = 0;
var drlTipRadians = 0;
var drlTipLength = 0;
var finalDrlDepth = 0;
var zDrlDepth = 0;  // accumalates incremental pecks for next pass
var zZero = 0;      // machine Z zero should be set to the surface being drilled
var tmpVar = 0;
var fullRetractFlag = 0;  // keep track of when to do full retract

function toggleDisablePecking(_checked) {

  if (_checked) {
      document.getElementById("peckDepth").disabled = true;
      document.getElementById("chipBrkRetract").disabled = true;
      document.getElementById("fullRetractDepth").disabled = true;
      document.getElementById("feedChipRetract").disabled = true;
  } else {
      document.getElementById("peckDepth").disabled = false;
      document.getElementById("chipBrkRetract").disabled = false;
      document.getElementById("fullRetractDepth").disabled = false;
      document.getElementById("feedChipRetract").disabled = false;
  }
}

function toggleXYParkPosition(_checked) {

  if (_checked) {
      document.getElementById("xPark").disabled = true;
      document.getElementById("yPark").disabled = true;
  } else {
      document.getElementById("xPark").disabled = false;
      document.getElementById("yPark").disabled = false;
  }
}

// Generate and fill the new window

function makeNewWindow( ) {

 getFormValues( ); // get values from forms

 // Check that drill dia is entered
 if (drlDia <= 0) {
    alert("Enter valid drill diameter.");
    return;
 }

 // Check that hole depth is entered
 if (holeDepth <= 0) {
    alert("Enter hole depth.\n(ex: 1/2 inch deep, enter .500");
    return;
 }

 // Check that Some Hole Coordinates have been selected/enterd
    if (xCoordArray.length < 1) {
       alert("Enter Hole Coordinates and\nselect \'Include\' Checkbox(s)");
       return;
    }

    // make sure it isn't already opened
    if (!newWindow || newWindow.closed) {

        newWindow = window.open("","_blank","status,height=500 \
                   ,width=400,toolbar=yes,scrollbars=yes \
                   ,resizable=yes,top=500,left=500");

//        newWindow = window.open("","sub","status,height=500 \
//                   ,width=400,toolbar=yes,scrollbars=yes \
//                   ,resizable=yes,top=500,left=500");

        // handle Navigator 2, which doesn't have an opener property
        if (!newWindow.opener) {
            newWindow.opener = window;
        }
        // delay writing until window exists in IE/Windows
        newWindowTitle(); // This works, but the title changes to "untitled"
        setTimeout("writeToWindow( )", 500);
    } else if (newWindow.focus) {
        // window is already open and focusable, so bring it to the front
        newWindow.focus( );
    }
}

function newWindowTitle() {
 if(newWindow.document) { // if loaded
      newWindow.document.title = "gCode"; // set newWindow title
 } else { // if not loaded yet
      setTimeout(newWindowTitle, 10); // check in another 10ms
 }
}

function writeToWindow( ) {

/* -- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// -- info for debugging
newWindow.document.write("$lengthUnits "+ $lengthUnits + "<br />");
newWindow.document.write(precision + " dec places Precision <br />");
newWindow.document.write("Drill Dia " + drlDia + "<br />");
newWindow.document.write("Drill Tip Angle " + drlTipAngle + " degrees<br />");
newWindow.document.write("Drill Tip Angle " + drlTipRadians + " radians<br />");
newWindow.document.write("Hole Depth " + holeDepth + "<br />");
newWindow.document.write("Break Thru Dist " + brkThruDist + "<br />");
newWindow.document.write("Drill to Tip or Dia = "+ $drlToTipDia + "<br />");
newWindow.document.write("Drill Tip Length = "+ drlTipLength + "<br />");
newWindow.document.write("finalDrlDepth = "+ finalDrlDepth + "<br />");
newWindow.document.write("peckDepth = "+ peckDepth + "<br />");
newWindow.document.write("chipBrkRetract = "+ chipBrkRetract + "<br />");
newWindow.document.write("fullRetractDepth = "+ fullRetractDepth + "<br />");
newWindow.document.write("feedZRapid = "+ feedZRapid + "<br />");
newWindow.document.write("feedZMove = "+ feedZMove + "<br />");
newWindow.document.write("feedZCut = "+ feedZCut + "<br />");
newWindow.document.write("feedChipRetract = "+feedChipRetract + "<br />");

newWindow.document.write("clrFixZHgt = "+ clrFixZHgt + "<br />");
newWindow.document.write("startDrlZHgt = "+startDrlZHgt + "<br />");
newWindow.document.write("xPark = "+ xPark + "<br />");
newWindow.document.write("yPark = "+ yPark + "<br />");

newWindow.document.write("Number of holes / xCoordArray.length "+ xCoordArray.length + "<br />");
for ( i=0; i < xCoordArray.length; i++) {
   newWindow.document.write("XY Coords " +  xCoordArray[i]+",   "+ yCoordArray[i] + "<br />");
}
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

newWindow.document.write("<hr />");
newWindow.document.write("<b>Cut and paste the following gCode into<br />");
newWindow.document.write("a plain text editor. Save as filename<u>.nc</u></b><br />");
newWindow.document.write("(Use ANSI encoding or Plain Text when saving.)<br />");
newWindow.document.write("<mark>Close this tab/window before creating</mark><br />");
newWindow.document.write("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
newWindow.document.write("<mark>a new drilling cycle.</mark><br />");
newWindow.document.write("<hr /><br />");


// **************************************************
// *** Write modal codes and  Safe Start position ***
// **************************************************

var $tmp = $lengthUnits + " G90";
newWindow.document.write($tmp + "<br />");

   if (document.getElementById("spindleOn").checked) {
      $tmp = "M3";
      newWindow.document.write($tmp + "<br />");
   }

   if (document.getElementById("codeM7").checked) {
      $tmp = "M7";
      newWindow.document.write($tmp + "<br />");
   }

   if (document.getElementById("codeM8").checked) {
      $tmp = "M8";
      newWindow.document.write($tmp + "<br />");
   }

// -- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// if incremental full retract not selected, set fullRetractDepth = finalDrlDepth.
// Full retract used to intermittently do complete retract from hole to clear chips.

   if ( Number(fullRetractDepth) == 0) {
      fullRetractDepth = finalDrlDepth;
   }


// -- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// if single pass selected, set peckDepth = finalDrlDepth.
// Just do a single pass, no pecking.

   if (document.getElementById("singlePass").checked) {
       peckDepth = finalDrlDepth;
   }


// **************************************************
// * MAIN LOOP - Step thru each set of hole coords
// **************************************************

for ( i=0; i < xCoordArray.length; i++) {
    newWindow.document.write("( HOLE LOCATION X" +  xCoordArray[i]+",  Y"+ yCoordArray[i] + " )<br />");
    $tmp = "G1 G94 Z"+ clrFixZHgt + " F" + feedZRapid;
    newWindow.document.write($tmp + "<br />");

    $tmp = "X"+ xCoordArray[i]+"  Y"+ yCoordArray[i];
    newWindow.document.write($tmp + "<br />");
    $tmp = "Z"+startDrlZHgt+" F"+feedZMove;
    newWindow.document.write($tmp + "<br />");

    zDrlDepth = zZero - Number(peckDepth);
    zDrlDepth = Number(zDrlDepth.toFixed(precision));
    fullRetractFlag = Number(0);

    while ( Math.abs(zDrlDepth) < Math.abs(finalDrlDepth) ) {
               $tmp = "Z"+zDrlDepth+" F"+feedZCut;
               newWindow.document.write($tmp + "<br />");
               // chip break
               tmpVar = Number(zDrlDepth) + Number(chipBrkRetract); // plus (+) retract drill up
               tmpVar = Number(tmpVar.toFixed(precision));
               $tmp = "Z"+tmpVar+" F"+feedChipRetract;
               newWindow.document.write($tmp + "<br />");
               zDrlDepth -= Number(peckDepth);
               zDrlDepth = Number(zDrlDepth.toFixed(precision));

               fullRetractFlag += Number(peckDepth);
               fullRetractFlag = Number(fullRetractFlag.toFixed(precision));
               if (Math.abs(fullRetractFlag) >= Math.abs(fullRetractDepth)) {
                   $tmp = "Z"+startDrlZHgt+" F"+feedZMove;
                   newWindow.document.write($tmp + "<br />");
                   fullRetractFlag = Number(0);
                   $tmp = "Z"+tmpVar; // back in hole, pick up where drilling left off
                   newWindow.document.write($tmp + "<br />");
               }  // end of IF for fullRetract check
     }  // end of WHILE loop

     // -------------------------------
     // do final peck to hole depth
     // -------------------------------

     $tmp = "Z-"+ finalDrlDepth +" F"+feedZCut;
     newWindow.document.write($tmp + "<br />");

     // retract Z to safe clear all height
     $tmp = "Z"+ clrFixZHgt + " F" + feedZRapid;
     newWindow.document.write($tmp + "<br />");

}  // End of MAIN LOOP (FOR stmt)

newWindow.document.write("(END OF DRILLING CYCLE)" + "<br />");

// **************************************************
// *** Write  Safe End / XY Park, Spindle Off     ***
// **************************************************

   // M9 turns off M8/M7 ie. coolant, spray mist, air
   // or whatever is connected to those control pins
   if (document.getElementById("codeM9").checked) {
      $tmp = "M9";
      newWindow.document.write($tmp + "<br />");
   }

   if (document.getElementById("spindleOff").checked) {
      $tmp = "M5";
      newWindow.document.write($tmp + "<br />");
   }

   $tmp = $lengthUnits + " G90";
   newWindow.document.write($tmp + "<br />");
   $tmp = "G1 G94 Z"+ clrFixZHgt + " F" + feedZRapid;
   newWindow.document.write($tmp + "<br />");


   if (document.getElementById("codeG28").checked) {
      $tmp = "G28";
      newWindow.document.write($tmp + "<br />");
      } else {
      $tmp = "X" + xPark +" Y" + yPark;
      newWindow.document.write($tmp + "<br />");
   }

   if (document.getElementById("endM30").checked) {
      $tmp = "M30";
      newWindow.document.write($tmp + "<br />");
   }
// **************************************************

newWindow.document.close( ); // close layout stream

} // end of function

// -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//                 end of writting gCode program
// -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

function getFormValues( ) {  // retrieve values from form
                             // var already declared by using them in input statements

//----------- machine units G20/G21 inch/mm --------------------

$lengthUnits = document.getElementById("unit").system.value;  //get value of radio buttons **

precision = document.getElementById("unit").places.value; //get value of input text **

//----------- drill bit parameters --------------------

drlDia = Number(document.getElementById("drlDiameter").value); //? why need Number prefix ?
   drlDia = drlDia.toFixed(precision);

drlTipAngle = Number(document.getElementById("drlTipAngle").value);
  // Convert drlTipAngle degrees (1/2 of angle) to radians
  var PI = 3.14593;
  var tmp = 90 - (drlTipAngle / 2);
  drlTipRadians = tmp * (PI / 180);
  drlTipRadians = drlTipRadians.toFixed(3);

holeDepth = Number(document.getElementById("holeDepth").value);
   holeDepth = holeDepth.toFixed(precision);

brkThruDist = Number(document.getElementById("brkThruDist").value);
   brkThruDist = brkThruDist.toFixed(precision);

$drlToTipDia = document.getElementById("drlParameters").drlToTipDia.value;

if ($drlToTipDia == "dia" && drlTipAngle > 0)  {
   drlTipLength = Number(Math.tan(drlTipRadians) * (drlDia / 2));
} else {
  drlTipLength = 0;
}
drlTipLength = Number(drlTipLength.toFixed(precision));

   // thought holeDepth brkThruDist drlTipLength were already decimal numbers ???
finalDrlDepth = parseFloat(holeDepth) + parseFloat(brkThruDist) + parseFloat(drlTipLength);
finalDrlDepth = Number(finalDrlDepth.toFixed(precision));

peckDepth = Number(document.getElementById("peckDepth").value);
   peckDepth = peckDepth.toFixed(precision);

chipBrkRetract = Number(document.getElementById("chipBrkRetract").value);
   chipBrkRetract = chipBrkRetract.toFixed(precision);

fullRetractDepth = Number(document.getElementById("fullRetractDepth").value);
   fullRetractDepth = fullRetractDepth.toFixed(precision);

//-----------       feedrates     --------------------

feedZRapid = Number(document.getElementById("feedZRapid").value);
   feedZRapid = feedZRapid.toFixed("1");

feedZMove = Number(document.getElementById("feedZMove").value);
   feedZMove = feedZMove.toFixed("1");

feedZCut = Number(document.getElementById("feedZCut").value);
   feedZCut = feedZCut.toFixed("1");

feedChipRetract = Number(document.getElementById("feedChipRetract").value);
   feedChipRetract = feedChipRetract.toFixed("1");

//----------- safe/clear positions, XY Park --------------------

clrFixZHgt = Number(document.getElementById("clrFixZHgt").value);
   clrFixZHgt = clrFixZHgt.toFixed(precision);

startDrlZHgt = Number(document.getElementById("startDrlZHgt").value);
   startDrlZHgt = startDrlZHgt.toFixed(precision);

xPark = Number(document.getElementById("xPark").value);
  xPark =xPark.toFixed(precision);

yPark = Number(document.getElementById("yPark").value);
  yPark =yPark.toFixed(precision);

// ------------------- X,Y Coordinates ------------------

arrayCounter = 0;

// Clear the array elements
// This is wonky, but the only
// way I could consistantly clear/reset the array.
//
xCoordArray = [];
if (xCoordArray.length > 0) {
	for (iErase=0; iErase<xCoordArray.length; iErase++)  {
		xCoordArray.pop();
		yCoordArray.pop();
	}
}

if (document.getElementById("holeChkBox0").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x0Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y0Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox1").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x1Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y1Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox2").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x2Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y2Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox3").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x3Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y3Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox4").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x4Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y4Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox5").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x5Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y5Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox6").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x6Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y6Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox7").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x7Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y7Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox8").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x8Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y8Coord").value).toFixed(precision);
	arrayCounter++;
}

if (document.getElementById("holeChkBox9").checked) {
	xCoordArray[arrayCounter] = Number(document.getElementById("x9Coord").value).toFixed(precision);
	yCoordArray[arrayCounter] = Number(document.getElementById("y9Coord").value).toFixed(precision);
	// arrayCounter++;
	// If this is the last hole, don't increment arrayCounter,
	//   it tracks the total number of holes to drill and is used
	//   in the 'for' loop to parse thru the hole locations.
}

}
