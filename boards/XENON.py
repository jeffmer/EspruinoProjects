#!/bin/false
# This file is part of Espruino, a JavaScript interpreter for Microcontrollers
#
# Copyright (C) 2013 Gordon Williams <gw@pur3.co.uk>
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# ----------------------------------------------------------------------------------------
# This file contains information for a specific board - the available pins, and where LEDs,
# Buttons, and other in-built peripherals are. It is used to build documentation as well
# as various source and header files for Espruino.
# ----------------------------------------------------------------------------------------

import pinutils;

info = {
 'name' : "Particle Xenon",
 'link' :  [ "https://docs.particle.io/datasheets/discontinued/xenon-datasheet/" ],
 'espruino_page_link' : 'nRF52840DK',
 'default_console' : "EV_BLUETOOTH",
 'variables' : 12500, # How many variables are allocated for Espruino to use. RAM will be overflowed if this number is too high and code won't compile.
 'bootloader' : 1,
 'binary_name' : 'espruino_%v_xenon.hex',
 'build' : {
   'optimizeflags' : '-Os',
   'libraries' : [
     'BLUETOOTH',
#     'TERMINAL',
     'GRAPHICS',
     'CRYPTO','SHA256','SHA512',
     'JIT' # JIT compiler enabled
   ],
   'makefile' : [
     'DEFINES += -DCONFIG_GPIO_AS_PINRESET', # Allow the reset pin to work
     'DEFINES += -DCONFIG_NFCT_PINS_AS_GPIOS', # Allow us to use NFC pins as GPIO
     'DEFINES += -DNRF_USB=1 -DUSB',
     'DEFINES += -DESPR_LSE_ENABLE', # Ensure low speed external osc enabled
     'DEFINES += -DNRF_SDH_BLE_GATT_MAX_MTU_SIZE=131', # 23+x*27 rule as per https://devzone.nordicsemi.com/f/nordic-q-a/44825/ios-mtu-size-why-only-185-bytes
     'DEFINES += -DCENTRAL_LINK_COUNT=2 -DNRF_SDH_BLE_CENTRAL_LINK_COUNT=2', # allow two outgoing connections at once
     'LDFLAGS += -Xlinker --defsym=LD_APP_RAM_BASE=0x3660', # set RAM base to match MTU=131 + CENTRAL_LINK_COUNT=2
     'DEFINES += -DESPR_DCDC_ENABLE=1', # Use DC/DC converter
     'ESPR_BLUETOOTH_ANCS=1', # Enable ANCS (Apple notifications) support
#    'DEFINES += -DSPIFLASH_SLEEP_CMD', # SPI flash needs to be explicitly slept and woken up
#    'DEFINES += -DSPIFLASH_READ2X', # Read SPI flash at 2x speed using MISO and MOSI for IO
     'DEFINES += -DESPR_JSVAR_FLASH_BUFFER_SIZE=32', # The buffer size we use when executing/iterating over data in flash memory (default 16). Should be set based on benchmarks.
     'DEFINES+=-DUSE_FONT_6X8 -DGRAPHICS_PALETTED_IMAGES -DGRAPHICS_ANTIALIAS',
     'DEFINES+=-DBLE_HIDS_ENABLED=1 -DBLUETOOTH_NAME_PREFIX=\'"XENON"\'',
     'DEFINES+=-DLCD_HEIGHT=122 -DLCD_WIDTH=250',
     'DEFINES+=-DDUMP_IGNORE_VARIABLES=\'"g\\0"\'',
     'DEFINES+=-DNO_DUMP_HARDWARE_INITIALISATION', # don't dump hardware init - not used and saves 1k of flash
     'DEFINES += -DESPR_NO_LINE_NUMBERS=1', # we execute mainly from flash, so line numbers can be worked out
     'DFU_PRIVATE_KEY=targets/nrf5x_dfu/dfu_private_key.pem',
     'DFU_SETTINGS=--application-version 0xff --hw-version 52 --sd-req 0xa9', #S140 6.0.0
     'BOOTLOADER_SETTINGS_FAMILY=NRF52840',
     'DEFINES += -DNRF_BL_DFU_INSECURE=1',
     'NRF_SDK15=1'
   ]
 }
};


chip = {
  'part' : "NRF52840",
  'family' : "NRF52",
  'package' : "QFN48",
  'ram' : 256,
  'flash' : 1024,
  'speed' : 64,
  'usart' : 2,
  'spi' : 1,
  'i2c' : 1,
  'adc' : 1,
  'dac' : 0,
  'saved_code' : {
    'address' : 0x60000000,
    'page_size' : 4096,
    'pages' : 1024, # use all of flash
    'flash_available' : 1024 - ((38 + 8 + 2)*4) # Softdevice uses 38 pages of flash (0x26000/0x100), bootloader 8, FS 2, code 20. Each page is 4 kb.
  },
};

devices = {
  'BTN1' : { 'pin' : 'D11', 'pinstate' : 'IN_PULLDOWN' }, # Pin negated in software
#RGB LED
  'LED1' : { 'pin' : 'D13' }, # Pin negated in software
  'LED2' : { 'pin' : 'D14' }, # Pin negated in software
  'LED3' : { 'pin' : 'D15' }, # Pin negated in software
  'RX_PIN_NUMBER' : { 'pin' : 'D8'},
  'TX_PIN_NUMBER' : { 'pin' : 'D6'},
#  'CTS_PIN_NUMBER' : { 'pin' : 'D7'},
#  'RTS_PIN_NUMBER' : { 'pin' : 'D5'},
  'SPIFLASH' : {
            'pin_cs' : 'D17',
            'pin_sck' : 'D19',
            'pin_mosi' : 'D20',
            'pin_miso' : 'D21',
            'pin_wp' : 'D22',
#            'pin_hold' : 'D23',
            'pin_rst' : 'D23', # no reset but this is HOLD pin for XENON, we want it set to 1
            'size' : 4096*1024, # 4MB
            'memmap_base' : 0x60000000,
          }


};

# left-right, or top-bottom order

board = {
};


def get_pins():
  pins = pinutils.generate_pins(0,47) # 48 General Purpose I/O Pins.
  pinutils.findpin(pins, "PD0", True)["functions"]["XL1"]=0;
  pinutils.findpin(pins, "PD1", True)["functions"]["XL2"]=0;
  pinutils.findpin(pins, "PD5", True)["functions"]["RTS"]=0;
  pinutils.findpin(pins, "PD6", True)["functions"]["TXD"]=0;
  pinutils.findpin(pins, "PD7", True)["functions"]["CTS"]=0;
  pinutils.findpin(pins, "PD8", True)["functions"]["RXD"]=0;
  pinutils.findpin(pins, "PD9", True)["functions"]["NFC1"]=0;
  pinutils.findpin(pins, "PD10", True)["functions"]["NFC2"]=0;
  pinutils.findpin(pins, "PD2", True)["functions"]["ADC1_IN0"]=0;
  pinutils.findpin(pins, "PD3", True)["functions"]["ADC1_IN1"]=0;
  pinutils.findpin(pins, "PD4", True)["functions"]["ADC1_IN2"]=0;
  pinutils.findpin(pins, "PD5", True)["functions"]["ADC1_IN3"]=0;
  pinutils.findpin(pins, "PD28", True)["functions"]["ADC1_IN4"]=0;
  pinutils.findpin(pins, "PD29", True)["functions"]["ADC1_IN5"]=0;
  pinutils.findpin(pins, "PD30", True)["functions"]["ADC1_IN6"]=0;
  pinutils.findpin(pins, "PD31", True)["functions"]["ADC1_IN7"]=0;
  # Make buttons and LEDs negated
  pinutils.findpin(pins, "PD13", True)["functions"]["NEGATED"]=0;
  pinutils.findpin(pins, "PD14", True)["functions"]["NEGATED"]=0;
  pinutils.findpin(pins, "PD15", True)["functions"]["NEGATED"]=0;
  pinutils.findpin(pins, "PD11", True)["functions"]["NEGATED"]=0;
  # everything is non-5v tolerant
  for pin in pins:
    pin["functions"]["3.3"]=0;
  #The boot/reset button will function as a reset button in normal operation. Pin reset on PD21 needs to be enabled on the nRF52832 device for this to work.
  return pins