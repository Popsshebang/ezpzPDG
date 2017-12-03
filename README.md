# ezpzPDG - depriciated
# please see https://github.com/Popsshebang/PDG

or go to https://popsshebang.github.io/PDG/   

Generate G-Code program for peck drilling holes.  
  
Enter up to 10 X/Y Hole Coordinates. 
Set step depths, retract amounts, feeds etc.  
Will also generate single pass drilling cycles.  
  
Click 'Generate PeckDrill gCode' Button to generate drilling program.   
Once the gCode is generated, you can edit it in the textarea window.  
ex. additional comments, boilerplate code, etc.

Examine code. When ready, click button below text widow to save gCode to file.

Note: X-carve uses the filename extension ".nc"

If more than 10 holes needed, either concatenate 2 files   
or use dxfPDG.  dxfPDG reads the hole locations from a dxf drawing file. 

# dxfPDG
https://popsshebang.github.io/ezpzPDG/dxfPDGv.01alpha.html   
Reads hole locations from a 2D dxf file. Then generates and displays  
gCode file. When satisified with settings, save gCode to file.
