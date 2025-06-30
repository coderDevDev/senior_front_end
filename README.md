admin

echo@admin.com
admin123

- cashier page credentials:

admin@gmail.com
admin123

- senior access credentials:

ase@dev.com
--or--
example@dev.com
admin123

Then eto po yung sa supabase

Email: bookletsenior@gmail.com
PW: &Bookletsenior2002

admin

echo@admin.com
admin123

- cashier page credentials:

admin@gmail.com
admin123

- senior access credentials:

ase@dev.com
--or--
example@dev.com
admin123

Then eto po yung sa supabase

Email: bookletsenior@gmail.com
PW: &Bookletsenior2002

Admin Side

1. Forget Password, 'di po pala siya nagana. [not your fault po, akala po naming gumagana na siya before] - DONE

Supabase

1. yung mga passwords po is nakikita pa rin po don for both user and senior, possible po kayang gawing hash siya but still makakapasok pa rin sa system? DONE

2. Refill reminders; sa cashier side rin po siya, given for inventory nga po yung reminder na yon though, pwede rin na tanggalin yon sa side ng admin and more on sa cashier side lang

3. Senior Citizen Medicine Statistics po is 'di pa po gumagana

4. From the user; senior citizen, yung medical record should be seen sa senior citizen side profile - DONE

4.1. Profile pic of the senior should be seen from this side

Cashier Side

1. Kita yung stores na available, number of medicines available for inventory, medicine stock levels - Detailed Medicine Dashboard which is nasa cashier side rin po - DONE

2. Medicine management should be seen on the Cashier - DONE

3. History [Transactions] Search filter - DONE
   3.1 By Medicines
   3.2 By Senior Citizens

[possible po kaya yung para bang for a specific acc, etong mga medicines lang po makikita niya na for example, TGP, TGP medicines lang or for watsons, watsons lang.
parang magulo po kasi yung transaction esp nung nag pa eval kami sa mga pharmacists; can be explained further pa po kung magulo]

Senior Citizen Side

1. Search bar should be smooth - Nagstop siya every time may itype - DONE
2. Pharmacy can be searched too, makikita yung mga medicine available sa pharmacy na yon - DONE
3. Yung sa home, makikita yung description of each medicine since if you check sa cashier, there's a description na makikita which should've been sa side rin ng senior side - DONE
4. Medical record would be included sa senior citizen profile - DONE

4.1. Profile pic of the senior should be seen sa admin side rin - DONE

Fingerprint Side

1. Maintegrate sa system or Pop-up sa mismong website (ang sabi kasi ng adviser naming for this is mas better raw kung hindi na siya kailangan iclick pa since magkaibang software, then he suggested na baka pwede raw na pop up na lang na pag clinick yung button is mag pop up siya instead na iclick pa yung form).

Deployment of the system
Yung napagusapan po before na yun nga ideploy pa rin po siya after

Kuya @Dex Miranda, eto po pala yung overall. Pa-disregard po nung isa.

Admin:

- Remove the refill reminders, Recent orders, medicine stock levels and orders over time and it should be on the cashier side - DONE
- Remove the Senior Citizen Medicine statistics, it should be on the cashier side [Should be working pag nilagay a cashier side] - DONE
- Remove Medicine Management from the admin side - DONE
- Remove Medicine Report; it should be seen on the cashier side - DONE

Senior Citizen:

- Hindi pa rin ma search yung pharmacy - DONE
- The senior shouldn't be the one to edit their medical record, makikita lang nila (?) [I think better kung sa Cashier siya since pharmacy but not sure how sila mag input for each citizen]
- The description of the medicine should be read as a whole, 'di siya naclick if mahaba yung nakasulat - DONE please click it will show modal of the description

Cashier:

- Senior Medicine Statistics doesn't work -verify actual data
- cashier menu masyadong nasa gilid, but this is what I input para 'di na sa gilid
  [ className="absolute left-1/2 -translate-x-1/2 mt-2 w-96 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-100 transform" ] - DONE
- also picture for the cashier profile [ default-avatar.png na nakalagay sa public, but I can send here po yung ginamit ko as a look lang po para di mukhang sirang image yung nakalagay ] - DONE
- [all should be working] refill reminders, Recent orders, medicine stock levels and orders over time should be on the cashier side - DONE
- Medicine Report should be on the cashier side - DONE

- Different acc for each pharmacy e.g TGP, WATSONS para 'di magulo

(e.g pag TGP pharmacy, Ayun lang na medicine makikita nila, pag Watson, Watson lang.)

- Transaction side neto would be different given na kung sino yung nagtransact lang sa Watson is yun lang makikita niya, while sa TGP naman is yun lang din.

Watson - >
