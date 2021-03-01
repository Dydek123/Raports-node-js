echo -n "Podaj cene maksymalna: "
read max
while [ ! -z $kategoria ]
do
    awk 'BEGIN {x = 0;}
    $1=="'$kategoria'" && $3 > 0 && $4 < '$2' {print $2, " ", $4; x=x+1;}
    END {print "wybranych pozycji: ", x;}' $1

    echo -n "Podaj kategorie: "
    read kategoria
done

