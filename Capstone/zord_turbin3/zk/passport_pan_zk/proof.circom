pragma circom 2.2.2;

include "circomlib/circuits/poseidon.circom";

template PassportPanMatch() {
    signal input passport_name;
    signal input passport_dob;
    signal input passport_number;

    signal input pan_name;
    signal input pan_dob;
    signal input pan_number;

    signal input passport_hash;
    signal input pan_hash;

    component passportHasher = Poseidon(3);
    passportHasher.inputs[0] <== passport_name;
    passportHasher.inputs[1] <== passport_dob;
    passportHasher.inputs[2] <== passport_number;

    passportHasher.out === passport_hash;

    component panHasher = Poseidon(3);
    panHasher.inputs[0] <== pan_name;
    panHasher.inputs[1] <== pan_dob;
    panHasher.inputs[2] <== pan_number;

    panHasher.out === pan_hash;

    passport_name === pan_name;
    passport_dob === pan_dob;

    signal output valid;
    valid <== 1;
}

component main = PassportPanMatch();