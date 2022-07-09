#!/bin/sh
set -euxo

ACCOUNT_NUMBER="${1}"
REGION="${2}"
PROFILE="${3}"

if [ -z "${ACCOUNT_NUMBER}" ];then
    echo "Account Number is required"
    exit 1
fi


if [ -z "${REGION}" ];then
    echo "Region is required"
    exit 1
fi

if [ -z "${PROFILE}" ];then
    echo "Profile is required"
    exit 1
fi

npm install
cdk bootstrap \
    --profile="$PROFILE" \
    --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
    "aws://${ACCOUNT_NUMBER}/$REGION"

exit 0    