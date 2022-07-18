import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Store } from "../Store";
import { getError } from "../utils";
import axios from "axios";
import "../Bambora.css";
function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false };

    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    case "DELIVER_RESET":
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}
function Bambora() {
  const [toks, setToks] = useState("");
  const { state,dispatch: ctxDispatch } = useContext(Store);
  const {cart, userInfo } = state;
const params = useParams();
const { id: orderId } = params;
const navigate = useNavigate();

const [
  {
    loading,
    error,
    order,
    successPay,
    loadingPay,
    loadingDeliver,
    successDeliver,
  },
  dispatch,
] = useReducer(reducer, {
  loading: true,
  order: {},
  error: "",
  successPay: false,
  loadingPay: false,
});

// function createOrder(data, actions) {
//   return actions.order
//     .create({
//       purchase_units: [
//         {
//           amount: { value: order.totalPrice },
//         },
//       ],
//     })
//     .then((orderID) => {
//       return orderID;
//     });
// }

// function onApprove(data, actions) {
//   return actions.order.capture().then(async function (details) {
//     try {
//       dispatch({ type: 'PAY_REQUEST' });
//       const { data } = await axios.put(
//         `/api/orders/${order._id}/pay`,
//         details,
//         {
//           headers: { authorization: `Bearer ${userInfo.token}` },
//         }
//       );
//       dispatch({ type: 'PAY_SUCCESS', payload: data });
//       toast.success('Order is paid');
//     } catch (err) {
//       dispatch({ type: 'PAY_FAIL', payload: getError(err) });
//       toast.error(getError(err));
//     }
//   });
//}
// function onError(err) {
//   toast.error(getError(err));
// }






  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate("/login");
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
      if (successDeliver) {
        dispatch({ type: "DELIVER_RESET" });
      }
    }
    (function () {
      var customCheckout = window.customcheckout();

      var isCardNumberComplete = false;
      var isCVVComplete = false;
      var isExpiryComplete = false;

      var customCheckoutController = {
        init: function () {
          console.log("checkout.init()");
          this.createInputs();
          this.addListeners();
        },
        createInputs: function () {
          console.log("checkout.createInputs()");
          var options = {};

          // Create and mount the inputs
          options.placeholder = "Card number";
          customCheckout.create("card-number", options).mount("#card-number");

          options.placeholder = "CVV";
          customCheckout.create("cvv", options).mount("#card-cvv");

          options.placeholder = "MM / YY";
          customCheckout.create("expiry", options).mount("#card-expiry");
        },
        addListeners: function () {
          var self = this;

          // listen for submit button
          if (document.getElementById("checkout-form") !== null) {
            document
              .getElementById("checkout-form")
              .addEventListener("submit", self.onSubmit.bind(self));
          }

          customCheckout.on("brand", function (event) {
            console.log("brand: " + JSON.stringify(event));

            var cardLogo = "none";
            if (event.brand && event.brand !== "unknown") {
              var filePath =
                "https://cdn.na.bambora.com/downloads/images/cards/" +
                event.brand +
                ".svg";
              cardLogo = "url(" + filePath + ")";
            }
            document.getElementById("card-number").style.backgroundImage =
              cardLogo;
          });

          customCheckout.on("blur", function (event) {
            console.log("blur: " + JSON.stringify(event));
          });

          customCheckout.on("focus", function (event) {
            console.log("focus: " + JSON.stringify(event));
          });

          customCheckout.on("empty", function (event) {
            console.log("empty: " + JSON.stringify(event));

            if (event.empty) {
              if (event.field === "card-number") {
                isCardNumberComplete = false;
              } else if (event.field === "cvv") {
                isCVVComplete = false;
              } else if (event.field === "expiry") {
                isExpiryComplete = false;
              }
              self.setPayButton(false);
            }
          });

          customCheckout.on("complete", function (event) {
            console.log("complete: " + JSON.stringify(event));

            if (event.field === "card-number") {
              isCardNumberComplete = true;
              self.hideErrorForId("card-number");
            } else if (event.field === "cvv") {
              isCVVComplete = true;
              self.hideErrorForId("card-cvv");
            } else if (event.field === "expiry") {
              isExpiryComplete = true;
              self.hideErrorForId("card-expiry");
            }

            self.setPayButton(
              isCardNumberComplete && isCVVComplete && isExpiryComplete
            );
          });

          customCheckout.on("error", function (event) {
            console.log("error: " + JSON.stringify(event));

            if (event.field === "card-number") {
              isCardNumberComplete = false;
              self.showErrorForId("card-number", event.message);
            } else if (event.field === "cvv") {
              isCVVComplete = false;
              self.showErrorForId("card-cvv", event.message);
            } else if (event.field === "expiry") {
              isExpiryComplete = false;
              self.showErrorForId("card-expiry", event.message);
            }
            self.setPayButton(false);
          });
        },
        onSubmit: function (event) {
          var self = this;

          console.log("checkout.onSubmit()");

          event.preventDefault();
          self.setPayButton(false);
          self.toggleProcessingScreen();

          var callback = function (result) {
            console.log("token result : " + JSON.stringify(result));

            if (result.error) {
              self.processTokenError(result.error);
            } else {
              self.processTokenSuccess(result.token);
              setToks(result.token);
            }
          };

          console.log("checkout.createToken()");
          customCheckout.createToken(callback);
        },
        hideErrorForId: function (id) {
          console.log("hideErrorForId: " + id);

          var element = document.getElementById(id);

          if (element !== null) {
            var errorElement = document.getElementById(id + "-error");
            if (errorElement !== null) {
              errorElement.innerHTML = "";
            }

            var bootStrapParent = document.getElementById(id + "-bootstrap");
            if (bootStrapParent !== null) {
              bootStrapParent.className = "form-group has-feedback has-success";
            }
          } else {
            console.log("showErrorForId: Could not find " + id);
          }
        },
        showErrorForId: function (id, message) {
          console.log("showErrorForId: " + id + " " + message);

          var element = document.getElementById(id);

          if (element !== null) {
            var errorElement = document.getElementById(id + "-error");
            if (errorElement !== null) {
              errorElement.innerHTML = message;
            }

            var bootStrapParent = document.getElementById(id + "-bootstrap");
            if (bootStrapParent !== null) {
              bootStrapParent.className = "form-group has-feedback has-error ";
            }
          } else {
            console.log("showErrorForId: Could not find " + id);
          }
        },
        setPayButton: function (enabled) {
          console.log("checkout.setPayButton() disabled: " + !enabled);

          var payButton = document.getElementById("pay-button");
          if (enabled) {
            payButton.disabled = false;
            payButton.className = "btn btn-primary";
          } else {
            payButton.disabled = true;
            payButton.className = "btn btn-primary disabled";
          }
        },
        toggleProcessingScreen: function () {
          var processingScreen = document.getElementById("processing-screen");
          if (processingScreen) {
            processingScreen.classList.toggle("visible");
          }
        },
        showErrorFeedback: function (message) {
          var xMark = "\u2718";
          this.feedback = document.getElementById("feedback");
          this.feedback.innerHTML = xMark + " " + message;
          this.feedback.classList.add("error");
        },
        showSuccessFeedback: function (message) {
          var checkMark = "\u2714";
          this.feedback = document.getElementById("feedback");
          this.feedback.innerHTML = checkMark + " " + message;
          this.feedback.classList.add("success");
        },
        processTokenError: function (error) {
          error = JSON.stringify(error, undefined, 2);
          console.log("processTokenError: " + error);

          this.showErrorFeedback(
            "Error creating token: </br>" + JSON.stringify(error, null, 4)
          );
          this.setPayButton(true);
          this.toggleProcessingScreen();
        },
        processTokenSuccess: function (token) {
          console.log("processTokenSuccess: " + token);

          this.showSuccessFeedback("Success! Created token: " + token);
          this.setPayButton(true);
          this.toggleProcessingScreen();

          // Use token to call payments api
          // this.makeTokenPayment(token);
        },
      };

      customCheckoutController.init();
    })();
  }, [order, userInfo, orderId, navigate, successPay, successDeliver]);

  console.log("hell yeah, my token is", toks);
  if (toks) {
    console.log("posting data to backend");
    const URL = "http://localhost:5001/api/bambora";
    console.log(
    //  "order._id.fullName =",
    //  order._id.fullName,
     // "orderID.fullName = ",
     // orderId.fullName,
    //  "order.shippingAddress.fullName = ",
    //  order.shippingAddress.fullName,
      "order.fullName = " , cart,
    );
    async function dataPoster() {
      await axios({
        method: "post",
        url: URL,
        data: {
          token: {
            name: cart.shippingAddress.fullName,
            code: toks,
          },
          billing: {
            name: cart.shippingAddress.fullName,
            address_line1: cart.shippingAddress.address,
            email_address: userInfo.email,
          },
        },
      }).then((res) => {
        if (res.status === 200) {
        navigate("/");
      }
      });
    }
    dataPoster();
  } else {
    console.log("sorry token is yet to be genrated/ there is some error");
  }

  return (
    <>
      <div class="container">
        <form id="checkout-form">
          <div id="card-number"></div>
          <label for="card-number" id="card-number-error"></label>

          <div id="card-cvv"></div>
          <label for="card-cvv" id="card-cvv-error"></label>

          <div id="card-expiry"></div>
          <label for="card-expiry" id="card-expiry-error"></label>

          <input
            id="pay-button"
            type="submit"
            class="btn disabled"
            value="Pay"
            disabled="true"
          />

          <div id="feedback"></div>
        </form>
      </div>
    </>
  );
}

export default Bambora;
