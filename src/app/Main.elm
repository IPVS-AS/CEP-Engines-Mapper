import Html exposing (Html, fieldset, form, input, textarea, li, ul)
import Html.Attributes exposing (class, value)
import Html.Events exposing (onInput)


main : Program Never Model Msg
main =
  Html.program
    { init = (model, Cmd.none)
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none


-- MODEL

type alias Model =
  { mqttBroker : String
  , endEventName : String
  , events : List Event
  , eventId : Int
  , statements : List Statement
  , statementId : Int
  }


type alias Event =
  { id : Int
  , name : String
  , properties : List EventProperty
  , propertyId : Int
  }


type alias EventProperty =
  { id : Int
  , name : String
  , propType : String
  }


type alias Statement =
  { id : Int
  , name : String
  , query : String
  }


model : Model
model =
  { mqttBroker = "tcp://10.0.14.106:1883"
  , endEventName = "TemperatureEndEvent"
  , events = [ temperatureEvent ]
  , eventId = 1
  , statements = [ warningStatement ]
  , statementId = 1
  }


temperatureEvent : Event
temperatureEvent =
  { id = 0
  , name = "TemperatureEvent"
  , properties = [ { id = 0, name = "temperature", propType = "int" } ]
  , propertyId = 1
  }


warningStatement : Statement
warningStatement =
  { id = 0
  , name = "WarningTemperature"
  , query =
      "select * from TemperatureEvent\n" ++
      "match_recognize (\n" ++
      "measures A as temp1, B as temp2\n" ++
      "pattern (A B)\n" ++
      "define\n" ++
      "A as A.temperature > 400,\n" ++
      "B as B.temperature > 400)"
  }


-- UPDATE

type Msg
  = MqttBroker String
  | EndEventName String
  | UpdateEventName Int String
  | UpdateEventPropertyName Int Int String
  | UpdateEventPropertyType Int Int String
  | UpdateStatementName Int String
  | UpdateStatementQuery Int String


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    MqttBroker mqttBroker ->
      { model | mqttBroker = mqttBroker } ! []

    EndEventName endEventName ->
      { model | endEventName = endEventName } ! []

    UpdateEventName id name ->
      let
        updateName event =
          if event.id == id then
            { event | name = name }
          else
            event
      in
        { model | events = List.map updateName model.events }
          ! []

    UpdateEventPropertyName eventId propId name ->
      let
        updatePropName prop =
          if prop.id == propId then
            { prop | name = name }
          else
            prop

        updateEvent event =
          if event.id == eventId then
            { event | properties = List.map updatePropName event.properties }
          else
            event
      in
        { model | events = List.map updateEvent model.events }
          ! []

    UpdateEventPropertyType eventId propId propType ->
      let
        updatePropType prop =
          if prop.id == propId then
            { prop | propType = propType }
          else
            prop

        updateEvent event =
          if event.id == eventId then
            { event | properties = List.map updatePropType event.properties }
          else
            event
      in
        { model | events = List.map updateEvent model.events }
          ! []

    UpdateStatementName id name ->
      let
        updateName statement =
          if statement.id == id then
            { statement | name = name }
          else
            statement
      in
        { model | statements = List.map updateName model.statements }
          ! []

    UpdateStatementQuery id query ->
      let
        updateQuery statement =
          if statement.id == id then
            { statement | query = query }
          else
            statement
      in
        { model | statements = List.map updateQuery model.statements }
          ! []


-- VIEW

view : Model -> Html Msg
view model =
  form [ class "pure-form" ]
    [ input [ value model.mqttBroker, onInput MqttBroker ] []
    , input [ value model.endEventName, onInput EndEventName ] []
    , viewEvents model.events
    , viewStatements model.statements
    ]


viewEvents : List Event -> Html Msg
viewEvents events =
  ul [] <|
    List.map viewEvent events


viewEvent : Event -> Html Msg
viewEvent event =
  li []
    [ input
        [ value event.name
        , onInput (UpdateEventName event.id)
        ] []
    , viewEventProperties event.id event.properties
    ]


viewEventProperties : Int -> List EventProperty -> Html Msg
viewEventProperties eventId properties =
  ul [] <|
    List.map (viewEventProperty eventId) properties


viewEventProperty : Int -> EventProperty -> Html Msg
viewEventProperty eventId property =
  li []
    [ fieldset [ class "pure-group" ]
        [ input
            [ value property.name
            , onInput (UpdateEventPropertyName eventId property.id)
            ] []
        , input
            [ value property.propType
            , onInput (UpdateEventPropertyType eventId property.id)
            ] []
        ]
    ]



viewStatements : List Statement -> Html Msg
viewStatements statements =
  ul [] <|
    List.map viewStatement statements


viewStatement : Statement -> Html Msg
viewStatement statement =
  li []
    [ fieldset [ class "pure-group" ]
        [ input
            [ value statement.name
            , onInput (UpdateStatementName statement.id)
            ] []
        , textarea
            [ value statement.query
            , onInput (UpdateStatementQuery statement.id)
            ] []
        ]
    ]
