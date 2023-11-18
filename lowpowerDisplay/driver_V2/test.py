def update(x1,y1,x2,y2):
    for x in range(x1,x2+1):
        for y in range(y1,y2+1):
            row = x//2
            col = y//12
            bit = (~x)&1 | (11 - y%12)<<1
            index = 3*(col*125 + row)+(2-(bit//8))
            image = (y//8)*250+x
            imagebit = y%8
            if ((bit==0 or bit ==1) and (imagebit==0 or imagebit==4)):
                print("x=",x,"y=",y,"ibyte=",image,"ibit=",imagebit,"row=",row,"col=",col,"sbyte=",index,"bit=",bit)        


            